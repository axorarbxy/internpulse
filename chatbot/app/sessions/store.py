from collections import defaultdict
from datetime import datetime, timezone

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
