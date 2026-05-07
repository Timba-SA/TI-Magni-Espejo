from app.shared.unit_of_work import UnitOfWork
from app.shared.exceptions import UnauthorizedException, BadRequestException, NotFoundException
from app.modules.auth.schemas import LoginRequest, UserResponse, UserCreate
from app.modules.auth.utils import verify_password, get_password_hash
from app.core.security import create_access_token

VALID_ROLES = {"Admin", "Encargado", "Cliente"}

class AuthService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def authenticate_user(self, credentials: LoginRequest) -> tuple[UserResponse, str]:
        """Valida credenciales y retorna (UserResponse, jwt_token)."""
        with self.uow:
            user = self.uow.users.get_by_email_or_username(credentials.usernameOrEmail)
            if not user or not verify_password(credentials.password, user.hashed_password):
                raise UnauthorizedException("Credenciales inválidas")
            
            if not user.activo:
                raise UnauthorizedException("Tu cuenta ha sido suspendida. Contactá a un administrador.")

            user_response = UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                nombre=user.nombre,
                rol=user.rol,
                activo=user.activo
            )

            token = create_access_token({
                "sub": str(user.id),
                "username": user.username,
                "nombre": user.nombre,
                "rol": user.rol,
            })

            return user_response, token

    def register_user(self, data: UserCreate) -> UserResponse:
        with self.uow:
            if self.uow.users.get_by_email(data.email):
                raise BadRequestException("El email ya está registrado")
            if self.uow.users.get_by_username(data.username):
                raise BadRequestException("El nombre de usuario ya está en uso")

            user_data = {
                "username": data.username,
                "email": data.email,
                "nombre": data.nombre,
                "hashed_password": get_password_hash(data.password),
                "rol": "Cliente",  # Nuevo registro → Cliente por defecto
            }

            user = self.uow.users.create(user_data)
            self.uow.commit()

            return UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                nombre=user.nombre,
                rol=user.rol,
                activo=user.activo
            )

    def update_rol(self, user_id: int, new_rol: str) -> UserResponse:
        if new_rol not in VALID_ROLES:
            raise BadRequestException(f"Rol inválido. Los roles válidos son: {', '.join(VALID_ROLES)}")
        with self.uow:
            user = self.uow.users.get_by_id(user_id)
            if not user:
                raise NotFoundException("Usuario no encontrado")
            user.rol = new_rol
            self.uow.commit()
            return UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                nombre=user.nombre,
                rol=user.rol,
                activo=user.activo
            )

    def update_estado(self, user_id: int, activo: bool) -> UserResponse:
        with self.uow:
            user = self.uow.users.get_by_id(user_id)
            if not user:
                raise NotFoundException("Usuario no encontrado")
            user.activo = activo
            self.uow.commit()
            return UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                nombre=user.nombre,
                rol=user.rol,
                activo=user.activo
            )
