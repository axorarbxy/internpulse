# Sign-in ML boundary

Authentication currently uses deterministic validation, bcrypt password hashing, and JWTs. It has no machine-learning code or model dependency.

ML services belong to the recommendation, resume-analysis, fraud-detection, and chatbot features. This directory records the boundary so those services are not incorrectly coupled to sign-in.