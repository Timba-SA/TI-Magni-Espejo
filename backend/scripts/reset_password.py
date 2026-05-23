from app.core.database import engine
from sqlalchemy import text
from app.core.security import get_password_hash

hash_str = get_password_hash('lauti123')
with engine.begin() as conn:
    conn.execute(
        text("UPDATE usuarios SET password_hash = :hash WHERE email = 'lautisalinas4@gmail.com'"),
        {"hash": hash_str}
    )
    print('Password updated via raw SQL')
