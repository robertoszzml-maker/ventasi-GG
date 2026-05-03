import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'notificacion' })
export class Notificacion {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({
    name: 'tipoUsuario',
    type: 'int',
    nullable: false,
    default: 0
  })
  tipoUsuario: number;

  @Column({
    name: 'tipoNotificacion',
    type: 'varchar',
    comment: 'mensaje solicitud_diseno mensaje_viapublica propuesta_preparada',
    nullable: true,
    length: 20,
    default: null
  })
  tipoNotificacion: string;

  @Column({
    name: 'usuario_origen',
    type: 'int',
    nullable: false,
    default: 0
  })
  usuarioOrigenId: number;

  @Column({
    name: 'usuario_destino',
    type: 'int',
    nullable: false,
    default: 0,
    comment: "Solo se usa cuando la notif es un mensaje"
  })
  usuarioDestinoId: number;

  @Column({
    name: 'fecha',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  fecha: string;

  @Column({
    name: 'nota',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  nota: string;

  @Column({
    name: 'presupuestoId',
    type: 'int',
    nullable: true,
    default: null,
  })
  tipoId: number;


  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 100,
    nullable: true,
    default: null,
  })
  tipo: string;


  @Column({
    name: 'fecha_visto',
    type: 'datetime',
    nullable: true,
    default: null,
  })
  fechaVisto: string;
}
