import { Column, Entity, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';

@Entity({ name: 'mensaje' })
export class Mensaje {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({
    name: 'presupuestoId',
    type: 'int',
    nullable: false,
    default: 0
  })
  tipoId: number;

  @Column({
    name: 'tipo',
    type: 'varchar',
    length: '100',
    nullable: false,
    default: 'presupuesto'
  })
  tipo: string;

  @Column({
    name: 'fecha',
    type: 'datetime',
    nullable: true,
    default: null
  })
  fecha?: string;

  @Column({
    name: 'mensaje',
    type: 'longtext',
    nullable: true,
    default: null
  })
  mensaje?: string;

  @Column({
    name: 'usuario_origen',
    type: 'int',
    nullable: false,
    default: 0
  })
  usuarioOrigenId: number;

  @Column({
    name: 'usuario_origen_nombre',
    type: 'varchar',
    nullable: true,
    default: null
  })
  usuarioOrigenNombre?: string;

  @Column({
    name: 'usuario_destino',
    type: 'int',
    nullable: false,
    default: 0
  })
  usuarioDestino: number;

  @Column({
    name: 'usuario_destino_nombre',
    type: 'varchar',
    nullable: true,
    default: null
  })
  usuarioDestinoNombre?: string;

  @Column({
    name: 'fecha_visto',
    type: 'datetime',
    nullable: true,
    default: null
  })
  fecha_visto?: string;
}
