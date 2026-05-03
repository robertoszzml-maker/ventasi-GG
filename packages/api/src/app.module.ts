import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import configAuth from './config/auth.config';
import { enviroments } from './config/enviroments';
import configSMTP from './config/mail.config';
import { ROUTES } from './main.routes';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ArchivoModule } from './modules/archivo/archivo.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { MensajeModule } from './modules/mensaje/mensaje.module';
import { NotificacionModule } from './modules/notificacion/notificacion.module';
import { PlantillaNotificacionModule } from './modules/plantilla-notificacion/plantilla-notificacion.module';
import { EnvioNotificacionModule } from './modules/envio-notificacion/envio-notificacion.module';
import { ConfigModule as ConfiguracionModule } from './modules/config/config.module';
import { EjemploCategoriaModule } from './modules/ejemplo-categoria/ejemplo-categoria.module';
import { EjemploModule } from './modules/ejemplo/ejemplo.module';
import { ExcelExportService } from './services/excel-export/excel-export.service';
import { PdfExportService } from './services/pdf-export/pdf-export.service';
import { ExcelReaderService } from './services/excel-reader/excel-reader.service';
import { EmailService } from './services/email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitySubscriber } from './subscribers/entity.subscriber';
import { AuditoriaSubscriber } from './subscribers/auditoria.subscriber';
import { FamiliaModule } from './modules/familia/familia.module';
import { GrupoModule } from './modules/grupo/grupo.module';
import { SubgrupoModule } from './modules/subgrupo/subgrupo.module';
import { ColorModule } from './modules/color/color.module';
import { TalleModule } from './modules/talle/talle.module';
import { CurvaColorModule } from './modules/curva-color/curva-color.module';
import { CurvaTalleModule } from './modules/curva-talle/curva-talle.module';
import { ArticuloModule } from './modules/articulo/articulo.module';
import { ArticuloVarianteModule } from './modules/articulo-variante/articulo-variante.module';
import { UbicacionModule } from './modules/ubicacion/ubicacion.module';
import { ProveedorModule } from './modules/proveedor/proveedor.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { StockPorUbicacionModule } from './modules/stock-por-ubicacion/stock-por-ubicacion.module';
import { MovimientoInventarioModule } from './modules/movimiento-inventario/movimiento-inventario.module';
import { CaracteristicaVisitanteModule } from './modules/caracteristica-visitante/caracteristica-visitante.module';
import { RazonNoCompraModule } from './modules/razon-no-compra/razon-no-compra.module';
import { VisitaModule } from './modules/visita/visita.module';
import { ListaPrecioModule } from './modules/lista-precio/lista-precio.module';
import { ArticuloPrecioModule } from './modules/articulo-precio/articulo-precio.module';
import { VendedorModule } from './modules/vendedor/vendedor.module';
import { MedioPagoModule } from './modules/medio-pago/medio-pago.module';
import { CobroModule } from './modules/cobro/cobro.module';
import { VentaModule } from './modules/venta/venta.module';
import { CajaModule } from './modules/caja/caja.module';
import { ConceptoMovimientoModule } from './modules/concepto-movimiento/concepto-movimiento.module';
import { SesionCajaModule } from './modules/sesion-caja/sesion-caja.module';
import { MovimientoCajaModule } from './modules/movimiento-caja/movimiento-caja.module';
import { ArqueoCajaModule } from './modules/arqueo-caja/arqueo-caja.module';
import { UserAvatarModule } from './modules/user-avatar/user-avatar.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV] || '.env',
      load: [configAuth, configSMTP],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      password: process.env.MYSQL_PASSWORD,
      username: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      autoLoadEntities: true,
      legacySpatialSupport: false,
      timezone: 'America/Argentina/Buenos_Aires',
      dateStrings: true
    }),
    RouterModule.register(ROUTES),
    AuthModule,
    ArchivoModule,
    AuditoriaModule,
    ConfiguracionModule,
    MensajeModule,
    NotificacionModule,
    PlantillaNotificacionModule,
    EnvioNotificacionModule,
    EjemploCategoriaModule,
    EjemploModule,
    FamiliaModule,
    GrupoModule,
    SubgrupoModule,
    ColorModule,
    TalleModule,
    CurvaColorModule,
    CurvaTalleModule,
    ArticuloModule,
    ArticuloVarianteModule,
    UbicacionModule,
    ProveedorModule,
    ClienteModule,
    StockPorUbicacionModule,
    MovimientoInventarioModule,
    CaracteristicaVisitanteModule,
    RazonNoCompraModule,
    VisitaModule,
    ListaPrecioModule,
    ArticuloPrecioModule,
    VendedorModule,
    MedioPagoModule,
    CobroModule,
    VentaModule,
    CajaModule,
    ConceptoMovimientoModule,
    SesionCajaModule,
    MovimientoCajaModule,
    ArqueoCajaModule,
    UserAvatarModule,
  ],
  providers: [
    ExcelExportService,
    PdfExportService,
    ExcelReaderService,
    EmailService,
    EntitySubscriber,
    AuditoriaSubscriber,
  ],
})
export class AppModule { }
