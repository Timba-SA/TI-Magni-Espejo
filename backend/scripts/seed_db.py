import os
import sys
from sqlalchemy.orm import Session

# Add the backend directory to the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, create_tables
from app.modules.insumos.models import InsumoModel
from app.shared.unit_of_work import UnitOfWork
from app.modules.auth.utils import get_password_hash

SEED_DATA_INSUMOS = []

SEED_DATA_USERS = [
    {
        "username": "admin",
        "email": "admin@thefoodstore.com",
        "password": "admin123",
        "nombre": "Administrador Principal",
        "rol": "Admin",
    },
    {
        "username": "encargado",
        "email": "encargado@thefoodstore.com",
        "password": "encargado123",
        "nombre": "Encargado de Inventario",
        "rol": "Encargado",
    }
]

def seed_database():
    create_tables()
    uow = UnitOfWork(SessionLocal)
    
    try:
        with uow:
            # Seed Insumos
            count_insumos = uow.insumos.count_all()
            if count_insumos == 0:
                print("Poblando la base de datos con insumos iniciales...")
                for data in SEED_DATA_INSUMOS:
                    uow.insumos.create(data)
                uow.commit()
                print(f"¡Éxito! Se han creado {len(SEED_DATA_INSUMOS)} insumos.")
            else:
                print(f"La base de datos ya contiene {count_insumos} insumos. Saltando el seed de insumos.")
                
            # Seed Users
            user_admin = uow.users.get_by_username("admin")
            if not user_admin:
                print("Poblando la base de datos con usuarios iniciales...")
                for data in SEED_DATA_USERS:
                    user_data = data.copy()
                    user_data["hashed_password"] = get_password_hash(user_data.pop("password"))
                    uow.users.create(user_data)
                uow.commit()
                print(f"¡Éxito! Se han creado {len(SEED_DATA_USERS)} usuarios.")
            else:
                print("La base de datos ya contiene usuarios iniciales. Saltando el seed de usuarios.")
                
    except Exception as e:
        print(f"Error al poblar la BD: {e}")

if __name__ == "__main__":
    seed_database()
