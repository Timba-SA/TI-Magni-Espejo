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
        ("ENTREGADO", "Entregado", 4, True),
        ("CANCELADO", "Cancelado", 5, True)
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
        # Nuevos ingredientes para llegar a 47 (más de 2 páginas completas de insumos)
        ("Medallón de Pollo Crispy", "Medallón de pollo rebozado súper crocante", False, u_u, 120.0, 25.0, 1200.0),
        ("Queso Azul Premium", "Queso azul de sabor intenso", True, u_kg, 15.0, 3.0, 5800.0),
        ("Rúcula Fresca", "Rúcula selvática seleccionada y limpia", False, u_kg, 8.0, 2.0, 2200.0),
        ("Jamón Crudo Serrano", "Fetas finas de jamón crudo madurado", False, u_kg, 10.0, 2.0, 9500.0),
        ("Champiñones Fileteados", "Champiñones frescos cortados en láminas", False, u_kg, 12.0, 2.5, 4500.0),
        ("Cebolla Caramelizada", "Cebolla dulce cocida lentamente", False, u_kg, 20.0, 4.0, 1800.0),
        ("Salsa Barbacoa Casera", "Salsa barbacoa ahumada artesanal", False, u_L, 15.0, 3.0, 1100.0),
        ("Aderezo Alioli con Ajo", "Salsa alioli emulsionada con ajo asado", False, u_L, 10.0, 2.0, 1200.0),
        ("Parmesano Reggiano Rallado", "Queso parmesano reggiano de hebras finas", True, u_kg, 12.0, 3.0, 8500.0),
        ("Pimiento Rojo Asado", "Tiras de pimientos asados al horno", False, u_kg, 14.0, 3.0, 2800.0),
        ("Harina de Trigo 0000", "Harina de fuerza para masas", False, u_kg, 150.0, 30.0, 450.0),
        ("Levadura Fresca", "Levadura prensada en bloques", False, u_g, 5000.0, 1000.0, 5.0),
        ("Sal Fina Marina", "Sal marina pura refinada", False, u_g, 10000.0, 2000.0, 2.0),
        ("Azúcar Ledesma", "Azúcar blanco tipo A", False, u_kg, 40.0, 8.0, 600.0),
        ("Manteca Sancor", "Manteca de primera calidad para repostería", True, u_kg, 25.0, 5.0, 3200.0),
        ("Esencia de Vainilla", "Extracto aromático concentrado", False, u_mL, 2000.0, 500.0, 12.0),
        ("Lata Sprite Lima-Limón", "Lata de Sprite 354ml", False, u_u, 150.0, 30.0, 800.0),
        ("Lata Fanta Naranja", "Lata de Fanta 354ml", False, u_u, 150.0, 30.0, 800.0),
        ("Lata Cerveza Amber Lager", "Amber Lager Patagonia lata 473ml", True, u_u, 120.0, 20.0, 1500.0),
        ("Dulce de Leche Repostero", "Dulce de leche repostero San Ignacio", True, u_kg, 30.0, 6.0, 2800.0),
        ("Nueces Peladas Mariposa", "Mariposas de nueces enteras seleccionadas", True, u_kg, 8.0, 1.5, 7500.0),
    ]

    insumos_db = {}
    for nombre, descripcion, es_alergeno, unidad, stock_actual, stock_minimo, costo_unitario in insumos_data:
        existing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
        if not existing:
            insumo = Ingrediente(
                nombre=nombre,
                descripcion=descripcion,
                es_alergeno=es_alergeno,
                sa_column=None, # will use defaults
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
            "Hamburguesa Crispy Chicken",
            "Medallón de pollo rebozado súper crocante, lechuga, tomate fresco y aderezo alioli casero.",
            ["Hamburguesas"],
            [("Medallón de Pollo Crispy", 1.0), ("Pan Brioche de Papa", 1.0), ("Lechuga Capuchina", 0.03), ("Tomate Redondo", 0.03), ("Aderezo Alioli con Ajo", 15.0)]
        ),
        (
            "Hamburguesa Blue Cheese",
            "Medallón de carne premium, queso azul desmenuzado, cebolla caramelizada y cheddar.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 1.0), ("Queso Azul Premium", 0.03), ("Cebolla Caramelizada", 0.04)]
        ),
        (
            "Hamburguesa Triple Cheddar Bacon",
            "Triple carne premium, triple panceta crujiente y seis fetas de cheddar en pan de brioche.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 3.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 6.0), ("Panceta Ahumada Lonjas", 6.0)]
        ),
        (
            "Hamburguesa BBQ Smokehouse",
            "Carne premium, doble panceta, doble cheddar, cebolla caramelizada y salsa barbacoa.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 2.0), ("Panceta Ahumada Lonjas", 2.0), ("Cebolla Caramelizada", 0.03), ("Salsa Barbacoa Casera", 20.0)]
        ),
        (
            "Hamburguesa Vegana Deluxe",
            "Medallón vegetal NotCo, pan brioche, lechuga, rodajas de tomate y cebolla morada.",
            ["Hamburguesas"],
            [("Medallón Vegano NotCo", 1.0), ("Pan Brioche de Papa", 1.0), ("Lechuga Capuchina", 0.04), ("Tomate Redondo", 0.03), ("Cebolla Morada", 0.02)]
        ),
        (
            "Hamburguesa Egg & Bacon",
            "Medallón de carne premium, huevo a la plancha, panceta ahumada crujiente y cheddar.",
            ["Hamburguesas"],
            [("Medallón de Carne Premium", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 2.0), ("Panceta Ahumada Lonjas", 2.0), ("Huevo de Campo", 1.0)]
        ),
        (
            "Hamburguesa Simple NotCo",
            "Medallón vegano NotCo en tierno pan brioche de papa con doble cheddar.",
            ["Hamburguesas"],
            [("Medallón Vegano NotCo", 1.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 2.0)]
        ),
        (
            "Hamburguesa Doble NotCo",
            "Doble medallón vegano NotCo, cuatro fetas de cheddar y panceta crocante en pan brioche.",
            ["Hamburguesas"],
            [("Medallón Vegano NotCo", 2.0), ("Pan Brioche de Papa", 1.0), ("Queso Cheddar Milkaut", 4.0), ("Panceta Ahumada Lonjas", 4.0)]
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
            "Pizza Fugazzeta Rellena",
            "Doble masa de pizza casera, rellena de abundante muzzarella y cubierta de cebolla morada en aros y orégano.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 2.0), ("Queso Muzzarella Especial", 0.45), ("Cebolla Morada", 0.25), ("Orégano Seco", 6.0), ("Aceite de Oliva Extra Virgen", 15.0)]
        ),
        (
            "Pizza con Rúcula y Jamón Crudo",
            "Muzzarella, rúcula fresca desinfectada, finas fetas de jamón crudo y hebras de queso parmesano reggiano.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.22), ("Rúcula Fresca", 0.08), ("Jamón Crudo Serrano", 0.12), ("Parmesano Reggiano Rallado", 0.04), ("Aceite de Oliva Extra Virgen", 12.0)]
        ),
        (
            "Pizza de Champiñones y Queso Azul",
            "Salsa de tomate pomodoro, muzzarella, champiñones fileteados salteados y queso azul.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.22), ("Salsa de Tomate Pomodoro", 0.2), ("Champiñones Fileteados", 0.12), ("Queso Azul Premium", 0.05), ("Aceite de Oliva Extra Virgen", 8.0)]
        ),
        (
            "Pizza Margarita Italiana",
            "Salsa de tomate pomodoro italiana, abundante muzzarella, rodajas de tomate y aceite de oliva.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.26), ("Salsa de Tomate Pomodoro", 0.25), ("Tomate Redondo", 0.18), ("Aceite de Oliva Extra Virgen", 10.0)]
        ),
        (
            "Pizza Napolitana con Ajo",
            "Muzzarella, rodajas de tomate maduro, aceite de ajo alioli y abundante orégano.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.25), ("Tomate Redondo", 0.15), ("Aderezo Alioli con Ajo", 15.0), ("Orégano Seco", 5.0), ("Aceite de Oliva Extra Virgen", 5.0)]
        ),
        (
            "Pizza Cuatro Quesos",
            "Excelente combinación de muzzarella, cheddar premium, queso azul y parmesano rallado.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Queso Muzzarella Especial", 0.2), ("Queso Cheddar Milkaut", 2.0), ("Queso Azul Premium", 0.06), ("Parmesano Reggiano Rallado", 0.05)]
        ),
        (
            "Pizza Vegana NotCo",
            "Masa casera, salsa pomodoro, medallón vegano desmenuzado, tomate redondo y cebolla caramelizada.",
            ["Pizzas"],
            [("Masa de Pizza Casera", 1.0), ("Salsa de Tomate Pomodoro", 0.25), ("Medallón Vegano NotCo", 1.0), ("Tomate Redondo", 0.1), ("Cebolla Caramelizada", 0.06)]
        ),
        (
            "Papas Fritas Crujientes",
            "Papas fritas clásicas cortadas en bastón, doradas al punto justo.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.35)]
        ),
        (
            "Papas Fritas Cheddar Bacon",
            "Papas fritas clásicas con salsa cheddar derretida y lluvia de panceta crocante.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.4), ("Queso Cheddar Milkaut", 3.0), ("Panceta Ahumada Lonjas", 3.0)]
        ),
        (
            "Papas Rústicas con Alioli",
            "Papas rústicas con piel crujiente acompañadas de alioli emulsionado con ajo asado.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.38), ("Aderezo Alioli con Ajo", 20.0)]
        ),
        (
            "Papas Fritas Provenzal",
            "Papas bastón recién hechas bañadas en provenzal de ajo, perejil y orégano.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.35), ("Aderezo Alioli con Ajo", 10.0), ("Orégano Seco", 2.0)]
        ),
        (
            "Papas Fritas Veganas NotCo",
            "Papas fritas crujientes cubiertas de NotCo desmenuzado y alioli de ajo.",
            ["Guarniciones"],
            [("Papas Bastón Congeladas", 0.4), ("Medallón Vegano NotCo", 0.5), ("Aderezo Alioli con Ajo", 15.0)]
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
            "Sprite Lata 354ml",
            "Gaseosa refrescante sabor lima-limón en lata.",
            ["Gaseosas"],
            [("Lata Sprite Lima-Limón", 1.0)]
        ),
        (
            "Fanta Lata 354ml",
            "Gaseosa refrescante sabor naranja en lata.",
            ["Gaseosas"],
            [("Lata Fanta Naranja", 1.0)]
        ),
        (
            "Agua Mineral Sin Gas",
            "Agua mineral Nestlé pura de manantial 500ml.",
            ["Bebidas"],
            [("Botella Agua Mineral Sin Gas", 1.0)]
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
            "Cerveza Amber Lager Patagonia",
            "Cerveza artesanal Amber Lager Patagonia lata 473ml.",
            ["Cervezas"],
            [("Lata Cerveza Amber Lager", 1.0)]
        ),
        (
            "Cerveza Stella Artois Pack x6",
            "Six-pack de cerveza premium Stella Artois lata 473ml para compartir.",
            ["Cervezas"],
            [("Lata Cerveza Stella Artois", 6.0)]
        ),
        (
            "Cerveza IPA Patagonia Pack x6",
            "Six-pack de cerveza artesanal rubia Patagonia 24.7 IPA lata 473ml.",
            ["Cervezas"],
            [("Lata Cerveza IPA Patagonia", 6.0)]
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
        ),
        (
            "Tarta de Frutillas Deluxe",
            "Base de tarta dulce crujiente rellena de crema pastelera y frutillas frescas fileteadas.",
            ["Tortas"],
            [("Frutillas Frescas", 0.25), ("Crema de Leche Doble", 0.15), ("Azúcar Ledesma", 0.05), ("Manteca Sancor", 0.04)]
        ),
        (
            "Volcán de Chocolate",
            "Postre tibio con centro de chocolate líquido y crocante exterior de chocolate belga.",
            ["Tortas"],
            [("Chocolate Amargo Cobertura", 0.12), ("Manteca Sancor", 0.06), ("Azúcar Ledesma", 0.04), ("Huevo de Campo", 2.0)]
        ),
        (
            "Torta de Dulce de Leche y Nueces",
            "Capas alternadas de dulce de leche repostero premium y nueces crocantes trituradas.",
            ["Tortas"],
            [("Dulce de Leche Repostero", 0.3), ("Nueces Peladas Mariposa", 0.08), ("Manteca Sancor", 0.05), ("Huevo de Campo", 1.0)]
        ),
        (
            "Cheesecake de Frutilla",
            "Tarta fría de queso crema con base de galletas y salsa artesanal de frutillas naturales.",
            ["Tortas"],
            [("Frutillas Frescas", 0.25), ("Crema de Leche Doble", 0.2), ("Manteca Sancor", 0.06)]
        ),
        (
            "Brownie con Nueces",
            "Húmedo brownie de chocolate belga repleto de trozos de nueces seleccionadas.",
            ["Tortas"],
            [("Chocolate Amargo Cobertura", 0.1), ("Manteca Sancor", 0.08), ("Huevo de Campo", 2.0), ("Azúcar Ledesma", 0.06), ("Nueces Peladas Mariposa", 0.05)]
        ),
        (
            "Torta Rogel Expreso",
            "Capas finas de masa crocante rellenas con dulce de leche repostero y merengue italiano.",
            ["Tortas"],
            [("Dulce de Leche Repostero", 0.35), ("Manteca Sancor", 0.05), ("Azúcar Ledesma", 0.08), ("Huevo de Campo", 1.0)]
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
    import app.modules.auth.models        # Rol, UsuarioRol
    import app.modules.usuarios.models    # Usuario
    import app.modules.pedidos.models     # EstadoPedido, FormaPago
    import app.modules.productos.models   # Producto, ProductoCategoria, etc.
    import app.modules.categorias.models  # Categoria
    import app.modules.ingredientes.models  # Ingrediente
    import app.modules.direcciones.models  # DireccionEntrega
    import app.modules.pagos.models        # Pago

    print("Creating tables...")
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
