from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime, timezone
import os
import sqlite3
from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

from app.models.schemas import ConversationMessage


class InMemorySessionStore:
    def __init__(self) -> None:
        self._sessions: defaultdict[tuple[str, str], list[ConversationMessage]] = defaultdict(list)

    def new_session_id(self, student_id: str) -> str:
        return f"{student_id}-session-{len(self.session_ids(student_id)) + 1}"

    def session_ids(self, student_id: str) -> list[str]:
        return [session_id for owner, session_id in self._sessions if owner == student_id]

    def append(self, student_id: str, session_id: str, role: str, content: str) -> ConversationMessage:
        message = ConversationMessage(
            role=role,
            content=content,
            created_at=datetime.now(timezone.utc),
        )
        self._sessions[(student_id, session_id)].append(message)
        return message

    def history(self, student_id: str, session_id: str | None = None) -> tuple[str | None, list[ConversationMessage]]:
        if session_id:
            return session_id, list(self._sessions[(student_id, session_id)])
        sessions = [(key, messages) for key, messages in self._sessions.items() if key[0] == student_id]
        sessions.sort(key=lambda item: item[0][1])
        messages = [message for _, session_messages in sessions for message in session_messages]
        return None, messages


class SQLiteSessionStore:
    def __init__(self, database_path: str | Path) -> None:
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                "CREATE TABLE IF NOT EXISTS chat_sessions ("
                "student_id TEXT NOT NULL, session_id TEXT NOT NULL, created_at TEXT NOT NULL, "
                "PRIMARY KEY(student_id, session_id))"
            )
            connection.execute(
                "CREATE TABLE IF NOT EXISTS chat_messages ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, "
                "session_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, "
                "FOREIGN KEY(student_id, session_id) REFERENCES chat_sessions(student_id, session_id))"
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_chat_messages_owner_session "
                "ON chat_messages(student_id, session_id, id)"
            )

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.database_path, timeout=30)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()

    def new_session_id(self, student_id: str) -> str:
        return f"{student_id}-session-{uuid4().hex[:12]}"

    def session_ids(self, student_id: str) -> list[str]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT session_id FROM chat_sessions WHERE student_id=? ORDER BY created_at, session_id",
                (student_id,),
            ).fetchall()
        return [row["session_id"] for row in rows]

    def append(self, student_id: str, session_id: str, role: str, content: str) -> ConversationMessage:
        message = ConversationMessage(role=role, content=content, created_at=datetime.now(timezone.utc))
        with self._connect() as connection:
            connection.execute(
                "INSERT OR IGNORE INTO chat_sessions(student_id, session_id, created_at) VALUES (?, ?, ?)",
                (student_id, session_id, message.created_at.isoformat()),
            )
            connection.execute(
                "INSERT INTO chat_messages(student_id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
                (student_id, session_id, role, content, message.created_at.isoformat()),
            )
        return message

    def history(self, student_id: str, session_id: str | None = None) -> tuple[str | None, list[ConversationMessage]]:
        with self._connect() as connection:
            if session_id:
                rows = connection.execute(
                    "SELECT role, content, created_at FROM chat_messages "
                    "WHERE student_id=? AND session_id=? ORDER BY id",
                    (student_id, session_id),
                ).fetchall()
            else:
                rows = connection.execute(
                    "SELECT role, content, created_at FROM chat_messages WHERE student_id=? ORDER BY id",
                    (student_id,),
                ).fetchall()
        messages = [ConversationMessage.model_validate(dict(row)) for row in rows]
        return session_id, messages


def create_session_store() -> InMemorySessionStore | SQLiteSessionStore:
    data_dir = os.getenv("MODULE3_DATA_DIR", "").strip()
    if not data_dir:
        return InMemorySessionStore()
    return SQLiteSessionStore(Path(data_dir) / "chatbot.sqlite3")
