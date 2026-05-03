import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('archivo')
export class Archivo {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'varchar', nullable: true, })
    nombre: string;
    @Column({ type: 'varchar', nullable: false, name: 'nombre_archivo' })
    nombreArchivo: string;
    @Column({ type: 'varchar', nullable: false, name: 'nombre_archivo_original' })
    nombreArchivoOriginal: string;
    @Column({ type: 'varchar', nullable: true, name: 'url' })
    url: string;
    @Column({ type: 'varchar', nullable: false, })
    extension: string;
    @Column({ type: 'varchar', nullable: false, name: 'modelo' })
    modelo: string;
    @Column({ type: 'int', nullable: false, name: 'modelo_id' })
    modeloId: number;
    @Column({ type: 'varchar', nullable: false, name: 'tipo' })
    tipo: string;
}
