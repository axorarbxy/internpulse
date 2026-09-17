from app.models.schemas import CompanyScore, FeedbackRecord


class CompanyScorer:
    def score(self, company_id: str, feedback: list[FeedbackRecord]) -> CompanyScore:
        if not feedback:
            return CompanyScore(
                company_id=company_id,
                feedback_count=0,
                average_rating=0.0,
                average_sentiment=0.0,
                quality_score=0.5,
            )
        average_rating = sum(item.rating for item in feedback) / len(feedback)
        average_sentiment = sum(item.sentiment_score for item in feedback) / len(feedback)
        rating_component = average_rating / 5.0
        sentiment_component = (average_sentiment + 1.0) / 2.0
        quality_score = (0.7 * rating_component) + (0.3 * sentiment_component)
        return CompanyScore(
            company_id=company_id,
            feedback_count=len(feedback),
            average_rating=round(average_rating, 4),
            average_sentiment=round(average_sentiment, 4),
            quality_score=round(quality_score, 4),
        )
