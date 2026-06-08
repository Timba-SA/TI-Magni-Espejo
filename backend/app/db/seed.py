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
        session.flush()  # Para obtener el ID del admin recién creado

        # Asignar rol ADMIN
        admin_rol = UsuarioRol(usuario_id=admin.id, rol_codigo="ADMIN")
        session.add(admin_rol)

        print(f"Usuario '{email}' creado con rol ADMIN.")
    else:
        print(f"Usuario '{email}' ya existe.")

def seed_demo_data(session: Session):
    from decimal import Decimal
    from app.modules.categorias.models import Categoria
    from app.modules.ingredientes.models import Ingrediente
    from app.modules.productos.models import Producto, ProductoCategoria, ProductoIngrediente
    from app.modules.productos.service import recalcular_producto_stock_y_precio

    print("Iniciando seed de categorías, insumos y productos de prueba...")

    # 1. Recuperar unidades de medida
    u_kg = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "kg")).first()
    u_g = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "g")).first()
    u_L = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "L")).first()
    u_mL = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "mL")).first()
    u_u = session.exec(select(UnidadMedida).where(UnidadMedida.simbolo == "u")).first()

    if not all([u_kg, u_g, u_L, u_mL, u_u]):
        print("Advertencia: No se encontraron todas las unidades de medida. Creándolas primero...")
        return

    # 2. Categorías Padre e Hijo
    categorias_data = [
        # (nombre, descripcion, parent_name)
        ("Comidas", "Todo tipo de platos elaborados en nuestra cocina", None),
        ("Hamburguesas", "Hamburguesas premium con pan artesanal y guarnición", "Comidas"),
        ("Pizzas", "Pizzas artesanales cocidas en horno de piedra", "Comidas"),
        ("Guarniciones", "Papas fritas y acompañamientos crujientes", "Comidas"),
        ("Bebidas", "Línea completa de bebidas frías y cafetería", None),
        ("Gaseosas", "Bebidas cola y gaseosas en lata", "Bebidas"),
        ("Cervezas", "Cervezas importadas y artesanales locales", "Bebidas"),
        ("Postres", "Cierre dulce para coronar tu comida", None),
        ("Tortas", "Tortas, repostería y mousses artesanales", "Postres"),
    ]

    categorias_db = {}
    for nombre, descripcion, parent_name in categorias_data:
        existing = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if not existing:
            parent_id = None
            if parent_name:
                parent_id = categorias_db[parent_name].id
            cat = Categoria(nombre=nombre, descripcion=descripcion, parent_id=parent_id)
            session.add(cat)
            session.flush()
            categorias_db[nombre] = cat
            print(f"Categoría '{nombre}' creada.")
        else:
            categorias_db[nombre] = existing

    # 3. Insumos (Ingredientes)
    insumos_data = [
        # (nombre, descripcion, es_alergeno, unidad, stock_actual, stock_minimo, costo_unitario)
        ("Medallón de Carne Premium", "Medallón de carne vacuna premium 120g", False, u_u, 150.0, 30.0, 1500.0),
        ("Medallón Vegano NotCo", "Medallón a base de plantas", False, u_u, 50.0, 10.0, 1800.0),
        ("Pan Brioche de Papa", "Pan brioche artesanal súper tierno", False, u_u, 200.0, 40.0, 500.0),
        ("Queso Cheddar Milkaut", "Queso cheddar en fetas premium", True, u_u, 600.0, 100.0, 120.0),
        ("Panceta Ahumada Lonjas", "Láminas de panceta ahumada crujiente", False, u_u, 400.0, 80.0, 250.0),
        ("Huevo de Campo", "Huevo de granja seleccionado", True, u_u, 120.0, 24.0, 300.0),
        ("Lechuga Capuchina", "Hojas de lechuga fresca desinfectada", False, u_kg, 10.0, 2.0, 2000.0),
        ("Tomate Redondo", "Rodajas de tomate fresco", False, u_kg, 15.0, 3.0, 1500.0),
        ("Cebolla Morada", "Cebolla morada en aros finos", False, u_kg, 12.0, 2.5, 1000.0),
        ("Masa de Pizza Casera", "Bollo de masa levada artesanal", False, u_u, 80.0, 15.0, 600.0),
        ("Queso Muzzarella Especial", "Queso muzzarella rallado de primera", True, u_kg, 25.0, 5.0, 4500.0),
        ("Salsa de Tomate Pomodoro", "Salsa pomodoro estilo italiano", False, u_L, 35.0, 8.0, 900.0),
        ("Jamón Cocido Especial", "Jamón cocido de primera calidad", False, u_kg, 12.0, 3.0, 3800.0),
        ("Salame Calabrés", "Salame calabrés especiado picante", False, u_kg, 8.0, 2.0, 5500.0),
        ("Aceitunas Verdes", "Aceitunas verdes descarozadas", False, u_kg, 5.0, 1.0, 3200.0),
        ("Orégano Seco", "Orégano seleccionado triturado", False, u_g, 2000.0, 300.0, 15.0),
        ("Aceite de Oliva Extra Virgen", "Aceite de oliva en botella", False, u_mL, 10000.0, 1500.0, 5.0),
        ("Papas Bastón Congeladas", "Papas cortadas listas para freír", False, u_kg, 40.0, 8.0, 1500.0),
        ("Lata Coca-Cola Original", "Lata de Coca-Cola original 354ml", False, u_u, 300.0, 50.0, 800.0),
        ("Lata Coca-Cola Zero", "Lata de Coca-Cola zero azúcar 354ml", False, u_u, 200.0, 40.0, 800.0),
        ("Lata Cerveza IPA Patagonia", "Patagonia 24.7 IPA lata 473ml", True, u_u, 150.0, 30.0, 1600.0),
        ("Lata Cerveza Stella Artois", "Stella Artois rubia lata 473ml", True, u_u, 180.0, 30.0, 1400.0),
        ("Botella Agua Mineral Sin Gas", "Agua mineral Nestlé pura 500ml", False, u_u, 220.0, 40.0, 600.0),
        ("Frutillas Frescas", "Frutillas naturales maduras", False, u_kg, 8.0, 1.5, 3000.0),
        ("Crema de Leche Doble", "Crema para batir y repostería", True, u_L, 10.0, 2.0, 2500.0),
        ("Chocolate Amargo Cobertura", "Chocolate semi-amargo Fénix 60%", True, u_kg, 10.0, 2.0, 6500.0),
    ]

    insumos_db = {}
    for nombre, descripcion, es_alergeno, unidad, stock_actual, stock_minimo, costo_unitario in insumos_data:
        existing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
        if not existing:
            insumo = Ingrediente(
                nombre=nombre,
                descripcion=descripcion,
                es_alergeno=es_alergeno,
                unidad_medida_id=unidad.id if unidad else None,
                stock_actual=Decimal(str(stock_actual)),
                stock_minimo=Decimal(str(stock_minimo)),
                costo_unitario=Decimal(str(costo_unitario))
            )
            session.add(insumo)
            session.flush()
            insumos_db[nombre] = insumo
            print(f"Insumo '{nombre}' creado.")
        else:
            insumos_db[nombre] = existing

    # 4. Productos
    productos_data = [
        # (nombre, descripcion, [categoria_names], [recetas_items])
        (
            "Hamburguesa Simple Cheddar",
            "Medallón de carne vacuna premium, pan brioche tostado y doble cheddar.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 2.0)]
        ),
        (
            "Hamburguesa Doble Bacon Cheddar",
            "Doble medallón de carne vacuna premium, doble panceta crocante y cuatro fetas de cheddar.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 2.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 4.0), ("Panceta Ahumada Lonjas", 4.0)]
        ),
        (
            "Hamburguesa Veggie Delight",
            "Medallón vegetal, pan brioche tostado, queso cheddar, lechuga y tomate fresco.",
            ["Hamburguesas"],
            [("Medallón Vegano NotCo", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 1.0), ("Lechuga Capuchina", 0.04), ("Tomate Redondo", 0.03)]
        ),
        (
            "Pizza Muzzarella Tradicional",
            "Salsa de tomate casera, abundante muzzarella, aceitunas y orégano.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.28), ("Salsa de Tomate Pomodoro", 0.2), ("Orégano Seco", 8.0), ("Aceitunas Verdes", 0.05), ("Aceite de Oliva Extra Virgen", 10.0)]
        ),
        (
            "Pizza Calabresa Picante",
            "Salsa de tomate casera, muzzarella y rodajas de salame calabrés picante.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.25), ("Salsa de Tomate Pomodoro", 0.2), ("Salame Calabrés", 0.12), ("Aceite de Oliva Extra Virgen", 5.0)]
        ),
        (
            "Pizza Especial con Jamón",
            "Pizza clásica con muzzarella, jamón cocido seleccionado y orégano.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.25), ("Salsa de Tomate Pomodoro", 0.2), ("Jamón Cocido Especial", 0.15), ("Orégano Seco", 5.0)]
        ),
        (
            "Papas Fritas Crujientes",
            "Papas fritas clásicas cortadas en bastón, doradas al punto justo.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.35)]
        ),
        (
            "Coca-Cola Lata 354ml",
            "Gaseosa refrescante sabor original en lata.",
            ["Gaseosas"],
            [("Lata Coca-Cola Original", 1.0)]
        ),
        (
            "Coca-Cola Zero Lata",
            "Gaseosa refrescante zero azúcar en lata.",
            ["Gaseosas"],
            [("Lata Coca-Cola Zero", 1.0)]
        ),
        (
            "Cerveza IPA Patagonia",
            "Cerveza artesanal rubia Patagonia 24.7 IPA lata 473ml.",
            ["Cervezas"],
            [("Lata Cerveza IPA Patagonia", 1.0)]
        ),
        (
            "Cerveza Stella Artois",
            "Cerveza premium Stella Artois rubia lata 473ml.",
            ["Cervezas"],
            [("Lata Cerveza Stella Artois", 1.0)]
        ),
        (
            "Agua Mineral Sin Gas",
            "Agua mineral Nestlé pura de manantial 500ml.",
            ["Bebidas"],
            [("Botella Agua Mineral Sin Gas", 1.0)]
        ),
        (
            "Mousse de Chocolate Belga",
            "Exquisito mousse artesanal de chocolate belga semi-amargo con crema.",
            ["Tortas"],
            [("Chocolate Amargo Cobertura", 0.08), ("Crema de Leche Doble", 0.12)]
        ),
        (
            "Copa de Frutillas con Crema",
            "Frutillas naturales de estación acompañadas de crema doble batida.",
            ["Tortas"],
            [("Frutillas Frescas", 0.18), ("Crema de Leche Doble", 0.1)]
        )
    ]

    for prod_nombre, prod_desc, cat_names, receta_items in productos_data:
        existing_p = session.exec(select(Producto).where(Producto.nombre == prod_nombre)).first()
        if not existing_p:
            p = Producto(
                nombre=prod_nombre,
                descripcion=prod_desc,
                precio_base=Decimal("0.00"),
                stock_cantidad=0,
                disponible=True
            )
            session.add(p)
            session.flush()

            # Asociar categorías
            for c_name in cat_names:
                c_obj = categorias_db.get(c_name)
                if c_obj:
                    pc = ProductoCategoria(producto_id=p.id, categoria_id=c_obj.id, es_principal=True)
                    session.add(pc)

            # Asociar receta
            for ing_name, cant in receta_items:
                ing_obj = insumos_db.get(ing_name)
                if ing_obj:
                    pi = ProductoIngrediente(
                        producto_id=p.id,
                        ingrediente_id=ing_obj.id,
                        cantidad=Decimal(str(cant)),
                        unidad_medida_id=ing_obj.unidad_medida_id,
                        es_removible=True
                    )
                    session.add(pi)
            
            session.flush()
            # Recalcular precio y stock dinámico
            recalcular_producto_stock_y_precio(session, p.id)
            print(f"Producto '{prod_nombre}' creado ({p.stock_cantidad} u, ${p.precio_base}).")
        else:
            recalcular_producto_stock_y_precio(session, existing_p.id)
            print(f"Producto '{prod_nombre}' ya existe. Recalculado stock a {existing_p.stock_cantidad} y precio a ${existing_p.precio_base}.")


def main():
    print("Iniciando seed de datos...")
    
    # Crear tablas si no existen (solo para facilitar el seed local/testing)
    from sqlmodel import SQLModel

    # Importar TODOS los modelos para que queden registrados en el metadata.
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
        try:
            seed_roles(session)
            seed_estados(session)
            seed_formas_pago(session)
            seed_unidades_medida(session)
            seed_admin(session)
            seed_demo_data(session)
            
            session.commit()
            print("Seed finalizado exitosamente.")
        except Exception as e:
            session.rollback()
            print(f"Error crítico. Se hizo rollback del seed completo: {e}")
            raise

if __name__ == "__main__":
    main()
