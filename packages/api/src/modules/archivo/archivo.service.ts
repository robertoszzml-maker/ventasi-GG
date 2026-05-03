import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import { UpdateArchivoDto } from './dto/update-archivo.dto';
import { File } from '@nest-lab/fastify-multer';
import { FindManyOptions, Repository } from 'typeorm';
import { Archivo } from './entities/archivo.entity';
import { createReadStream, readFileSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { StreamableFile } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArchivoService {

  constructor(
    @InjectRepository(Archivo)
    private archivoRepository: Repository<Archivo>,
  ) { }

  create(createArchivoDto: CreateArchivoDto, file: File) {

    return this.archivoRepository.save({ ...createArchivoDto, extension: file.mimetype, url: file.path, nombreArchivo: file.filename, nombreArchivoOriginal: file.originalname });
  }

  async findAll(conditions: FindManyOptions<Archivo>): Promise<Archivo[]> {
    return this.archivoRepository.find(conditions)

  }

  findOne(id: number) {
    return this.archivoRepository.findOneBy({ id });
  }

  async getFile(id: number) {

    const archivo = await this.archivoRepository.findOneBy({ id });
    const filePath = join(process.cwd(), 'files', archivo.nombreArchivo);
    try {
      const file = createReadStream(filePath);
      return new StreamableFile(file);
    } catch (error) {
      throw new Error('Archivo no encontrado');
    }
  }

  async getFiles(ids: number[]) {
    // Buscar los archivos en la base de datos
    const archivos = await this.archivoRepository
      .createQueryBuilder('archivo')
      .where('archivo.id IN (:...ids)', { ids })
      .getMany();

    // Verificar si se encontraron archivos
    if (!archivos || archivos.length === 0) {
      throw new Error('No se encontraron archivos');
    }

    // Crear un array de StreamableFile
    const files = archivos.map((archivo) => {
      const filePath = join(process.cwd(), 'files', archivo.nombreArchivo);
      try {
        const file = createReadStream(filePath);
        return new StreamableFile(file);
      } catch (error) {
        throw new Error(`Archivo no encontrado: ${archivo.nombreArchivo}`);
      }
    });

    return files;
  }

  update(id: number, updateArchivoDto: UpdateArchivoDto, file: File) {

    return this.archivoRepository.findOneBy({ id }).then(async (archivo) => {
      if (!archivo) {
        throw new NotFoundException(`Archivo con id ${id} no encontrado`);
      }

      const filePath = join(process.cwd(), 'files', archivo.nombreArchivo);
      try {
        await unlink(filePath);  // Eliminar archivo físico
      } catch (error) {
        console.error(`Error al eliminar el archivo antiguo: ${error}`);
        throw new Error(`No se pudo eliminar el archivo anterior`);
      }

      const updatedArchivo = {
        ...updateArchivoDto,
        extension: file.mimetype,
        url: file.path,
        nombreArchivo: file.filename,
        nombreArchivoOriginal: file.originalname,
      };

      await this.archivoRepository.update(id, updatedArchivo);  // Actualiza los datos del archivo en la DB

      return this.archivoRepository.findOneBy({ id });
    })
  }

  async remove(id: number) {
    const archivo = await this.findOne(id);
    if (!archivo) {
      throw new NotFoundException(`Archivo con id ${id} no encontrado`);
    }
    const filePath = join(process.cwd(), 'files', archivo.nombreArchivo);

    try {
      await unlink(filePath);
    } catch (error) {
      console.error(`Error al eliminar el archivo: ${error}`);
      throw new Error(`No se pudo eliminar el archivo en disco`);
    }

    await this.archivoRepository.delete({ id });

    return { message: `Archivo con id ${id} eliminado correctamente` };
  }
  async getFileBase64(id: number): Promise<{
    base64: string;
    mimeType: string;
    nombreOriginal: string;
  }> {
    // 1. Buscar el archivo en la base de datos
    const archivo = await this.archivoRepository.findOneBy({ id });
    if (!archivo) {
      throw new NotFoundException(`Archivo con id ${id} no encontrado`);
    }

    // 2. Construir la ruta física del archivo
    const filePath = join(process.cwd(), 'files', archivo.nombreArchivo);

    try {
      // 3. Leer el archivo y convertirlo a base64
      const fileBuffer = readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');

      return {
        base64: base64,
        mimeType: archivo.extension, // Ej: "application/pdf"
        nombreOriginal: archivo.nombreArchivoOriginal,
      };
    } catch (error) {
      throw new Error(`Error al leer el archivo: ${error.message}`);
    }
  }
}
