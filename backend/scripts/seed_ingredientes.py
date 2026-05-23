import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.core.database import engine, create_db_and_tables
from app.modules.productos.models import UnidadMedida
from app.modules.ingredientes.models import Ingrediente

UNIDADES = [
    {"nombre": "Kilogramo",  "simbolo": "kg", "tipo": "masa"},
    {"nombre": "Gramo",      "simbolo": "g",  "tipo": "masa"},
    {"nombre": "Litro",      "simbolo": "L",  "tipo": "volumen"},
    {"nombre": "Mililitro",  "simbolo": "mL", "tipo": "volumen"},
    {"nombre": "Unidad",     "simbolo": "u",  "tipo": "unidad"},
    {"nombre": "Docena",     "simbolo": "doc","tipo": "unidad"},
]

INGREDIENTES = [
    {"nombre": "Salsa de tomate",    "es_alergeno": False},
    {"nombre": "Queso Muzzarella",   "es_alergeno": True},
    {"nombre": "Jamón cocido",       "es_alergeno": False},
    {"nombre": "Albahaca fresca",    "es_alergeno": False},
    {"nombre": "Harina 000",         "es_alergeno": True},
    {"nombre": "Aceite de oliva",    "es_alergeno": False},
    {"nombre": "Ajo",                "es_alergeno": False},
    {"nombre": "Cebolla",            "es_alergeno": False},
    {"nombre": "Pechuga de pollo",   "es_alergeno": False},
    {"nombre": "Carne vacuna",       "es_alergeno": False},
    {"nombre": "Queso Reggianito",   "es_alergeno": True},
    {"nombre": "Panceta ahumada",    "es_alergeno": False},
    {"nombre": "Huevo",              "es_alergeno": True},
    {"nombre": "Crema de leche",     "es_alergeno": True},
    {"nombre": "Tomate perita",      "es_alergeno": False},
]


def seed():
    create_db_and_tables()

    with Session(engine) as session:
        # ── Unidades de medida ────────────────────────────────────────────
        count_um = session.exec(select(UnidadMedida)).all()
        if not count_um:
            print("Insertando unidades de medida...")
            for u in UNIDADES:
                um = UnidadMedida(**u)
                session.add(um)
            session.commit()
            print(f"  -> {len(UNIDADES)} unidades creadas.")
        else:
            print(f"Ya existen {len(count_um)} unidades de medida. Saltando.")

        # Obtener la unidad "g" para asignar a ingredientes por defecto
        unidad_g = session.exec(
            select(UnidadMedida).where(UnidadMedida.simbolo == "g")
        ).first()

        # ── Ingredientes ──────────────────────────────────────────────────
        count_ing = session.exec(select(Ingrediente)).all()
        if not count_ing:
            print("Insertando ingredientes de ejemplo...")
            for i in INGREDIENTES:
                ing = Ingrediente(
                    nombre=i["nombre"],
                    es_alergeno=i["es_alergeno"],
                    is_active=True,
                    unidad_medida_id=unidad_g.id if unidad_g else None,
                )
                session.add(ing)
            session.commit()
            print(f"  -> {len(INGREDIENTES)} ingredientes creados.")
        else:
            print(f"Ya existen {len(count_ing)} ingredientes. Saltando.")

    print("\n¡Seed completado! Podés crear productos con sus recetas desde el panel.")


if __name__ == "__main__":
    seed()
