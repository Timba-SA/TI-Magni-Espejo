import sys
import os

# Permitir ejecutar el script directamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlmodel import Session, select
from app.core.config import settings
from app.core.database import engine
from app.core.security import get_password_hash
from app.modules.auth.models import Rol, UsuarioRol
from app.modules.pedidos.models import EstadoPedido, FormaPago
from app.modules.usuarios.models import Usuario
from app.modules.productos.models import UnidadMedida

def seed_roles(session: Session):
    roles = [
        ("ADMIN",     "Administrador",      "Acceso total al sistema"),
        ("ENCARGADO", "Encargado",          "Supervisor general del local"),
        ("CAJERO",    "Cajero",             "Gestión de caja y cobros"),
        ("COCINERO",  "Cocinero",           "Preparación de pedidos en cocina"),
        ("STOCK",     "Gestor de Stock",    "Gestión de insumos y productos"),
        ("PEDIDOS",   "Gestor de Pedidos",  "Gestión del flujo de pedidos"),
        ("CLIENT",    "Cliente",            "Acceso a la tienda pública"),
    ]
    for codigo, nombre, descripcion in roles:
        existing = session.get(Rol, codigo)
        if not existing:
            session.add(Rol(codigo=codigo, nombre=nombre, descripcion=descripcion))
            print(f"Rol '{codigo}' creado.")
    session.commit()

def seed_estados(session: Session):
    estados = [
        ("PENDIENTE", "Pendiente", 1, False),
        ("CONFIRMADO", "Confirmado", 2, False),
        ("EN_PREP", "En Preparación", 3, False),
        ("EN_CAMINO", "En Camino", 4, False),
        ("ENTREGADO", "Entregado", 5, True),
        ("CANCELADO", "Cancelado", 6, True)
    ]
    for codigo, descripcion, orden, es_terminal in estados:
        existing = session.get(EstadoPedido, codigo)
        if not existing:
            session.add(EstadoPedido(
                codigo=codigo, 
                descripcion=descripcion, 
                orden=orden, 
                es_terminal=es_terminal
            ))
            print(f"EstadoPedido '{codigo}' creado.")
    session.commit()

def seed_formas_pago(session: Session):
    formas = [
        ("MERCADOPAGO", "MercadoPago", True),
        ("EFECTIVO", "Efectivo", True),
        ("TRANSFERENCIA", "Transferencia", True)
    ]
    for codigo, descripcion, habilitado in formas:
        existing = session.get(FormaPago, codigo)
        if not existing:
            session.add(FormaPago(
                codigo=codigo,
                descripcion=descripcion,
                habilitado=habilitado
            ))
            print(f"FormaPago '{codigo}' creada.")
    session.commit()

def seed_unidades_medida(session: Session):
    unidades = [
        ("Kilogramo", "kg", "masa"),
        ("Gramo", "g", "masa"),
        ("Litro", "L", "volumen"),
        ("Mililitro", "mL", "volumen"),
        ("Unidad", "u", "unidad"),
        ("Docena", "doc", "unidad"),
        ("Metro cuadrado", "m²", "area")
    ]
    for nombre, simbolo, tipo in unidades:
        existing = session.exec(
            select(UnidadMedida).where(UnidadMedida.simbolo == simbolo)
        ).first()
        if not existing:
            session.add(UnidadMedida(
                nombre=nombre,
                simbolo=simbolo,
                tipo=tipo
            ))
            print(f"UnidadMedida '{simbolo}' ({nombre}) creada.")
    session.commit()

def seed_admin(session: Session):
    email = settings.ADMIN_EMAIL
    statement = select(Usuario).where(Usuario.email == email)
    existing_user = session.exec(statement).first()

    if not existing_user:
        hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
        admin = Usuario(
            nombre="Admin",
            apellido="Root",
            email=email,
            password_hash=hashed_password
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)

        # Asignar rol ADMIN
        admin_rol = UsuarioRol(usuario_id=admin.id, rol_codigo="ADMIN")
        session.add(admin_rol)
        session.commit()
        print(f"Usuario '{email}' creado con rol ADMIN.")
    else:
        print(f"Usuario '{email}' ya existe.")

def main():
    print("Iniciando seed de datos...")
    
    # Crear tablas si no existen (solo para facilitar el seed local/testing)
    from sqlmodel import SQLModel

    # Importar TODOS los modelos para que queden registrados en el metadata.
    # Sin estos imports, SQLModel no "conoce" las tablas y create_all las omite.
    import app.modules.auth.models        # Rol, UsuarioRol, RefreshToken
    import app.modules.usuarios.models    # Usuario
    import app.modules.pedidos.models     # EstadoPedido, FormaPago
    import app.modules.productos.models   # Producto, ProductoCategoria, etc.
    import app.modules.categorias.models  # Categoria
    import app.modules.ingredientes.models  # Ingrediente
    import app.modules.direcciones.models  # DireccionEntrega
    import app.modules.pagos.models        # Pago

    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        seed_roles(session)
        seed_estados(session)
        seed_formas_pago(session)
        seed_unidades_medida(session)
        seed_admin(session)
        
    print("Seed finalizado exitosamente.")

if __name__ == "__main__":
    main()
