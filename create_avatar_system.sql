-- Sistema de Avatares/Fotos de Perfil
-- Tabla para almacenar múltiples avatares por usuario

-- 1. Tabla de avatares de usuario
CREATE TABLE IF NOT EXISTS user_avatars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    archivo_id INT NOT NULL,
    nombre VARCHAR(100),
    es_principal BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (archivo_id) REFERENCES archivo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Agregar campo avatar_id a la tabla usuario (avatar actual seleccionado)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS avatar_id INT NULL;
ALTER TABLE usuario ADD CONSTRAINT fk_usuario_avatar 
    FOREIGN KEY (avatar_id) REFERENCES user_avatars(id) ON DELETE SET NULL;

-- 3. Insertar avatar por defecto para el administrador (ID: 1)
-- Nota: Esto requiere que exista un archivo en la tabla archivo
-- Por ahora dejamos la estructura lista

-- 4. Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_avatars_usuario ON user_avatars(usuario_id);
CREATE INDEX IF NOT EXISTS idx_user_avatars_principal ON user_avatars(usuario_id, es_principal);
