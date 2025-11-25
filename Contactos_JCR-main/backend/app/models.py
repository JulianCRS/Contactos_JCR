from enum import Enum

# class ParentescoEnum(str, Enum):
#     FAMILIAR = "Familiar"
#     AMOROSO = "Amoroso"
#     AMISTAD = "Amistad"
#     LABORAL = "Laboral"
#     EDUCATIVO = "Educativo"
#     OTRO = "Otro"

# class CategoriaEnum(str, Enum):
#     PERSONAL = "Personal"
#     PROFESIONAL = "Profesional"
#     EDUCATIVO = "Educativo"
#     SOCIAL = "Social"
#     SALUD = "Salud"
#     FINANCIERO = "Financiero"
#     EMERGENCIA = "Emergencia"
#     OTRO = "Otro"

class TipoContactoEnum(str, Enum):
    PROVEEDOR = "Proveedor"
    CLIENTE = "Cliente"
    EMPLEADO = "Empleado"
    EXTERNO = "Externo"
    SOCIO = "Socio"
    ALIADO = "Aliado"
    OTRO = "Otro"

class DetalleTipoEnum(str, Enum):
    # Proveedor
    MERCANCIA = "Mercancía"
    SERVICIOS = "Servicios"
    SOFTWARE = "Software"
    INSUMOS = "Insumos"
    LOGISTICA = "Logística"
    # Cliente
    CORPORATIVO = "Corporativo"
    PERSONA_NATURAL = "Persona natural"
    FRECUENTE = "Frecuente"
    POTENCIAL = "Potencial"
    # Empleado
    ADMINISTRATIVO = "Administrativo"
    OPERATIVO = "Operativo"
    FREELANCE = "Freelance"
    TEMPORAL = "Temporal"
    # Externo
    CONSULTOR = "Consultor"
    AUDITOR = "Auditor"
    CONTRATISTA = "Contratista"
    TECNICO = "Técnico"
    # Socio
    INVERSIONISTA = "Inversionista"
    COFUNDADOR = "Co-fundador"
    REPRESENTANTE_LEGAL = "Representante legal"
    # Aliado
    ONG = "ONG"
    ENTIDAD_PUBLICA = "Entidad pública"
    CAMARA_COMERCIO = "Cámara de comercio"
    UNIVERSIDAD = "Universidad"
    # Otro
    OTRO = "Otro"

# Diccionario para validar las relaciones entre tipo y detalle
TIPO_DETALLE_MAPPING = {
    TipoContactoEnum.PROVEEDOR: [
        DetalleTipoEnum.MERCANCIA,
        DetalleTipoEnum.SERVICIOS,
        DetalleTipoEnum.SOFTWARE,
        DetalleTipoEnum.INSUMOS,
        DetalleTipoEnum.LOGISTICA
    ],
    TipoContactoEnum.CLIENTE: [
        DetalleTipoEnum.CORPORATIVO,
        DetalleTipoEnum.PERSONA_NATURAL,
        DetalleTipoEnum.FRECUENTE,
        DetalleTipoEnum.POTENCIAL
    ],
    TipoContactoEnum.EMPLEADO: [
        DetalleTipoEnum.ADMINISTRATIVO,
        DetalleTipoEnum.OPERATIVO,
        DetalleTipoEnum.FREELANCE,
        DetalleTipoEnum.TEMPORAL
    ],
    TipoContactoEnum.EXTERNO: [
        DetalleTipoEnum.CONSULTOR,
        DetalleTipoEnum.AUDITOR,
        DetalleTipoEnum.CONTRATISTA,
        DetalleTipoEnum.TECNICO
    ],
    TipoContactoEnum.SOCIO: [
        DetalleTipoEnum.INVERSIONISTA,
        DetalleTipoEnum.COFUNDADOR,
        DetalleTipoEnum.REPRESENTANTE_LEGAL
    ],
    TipoContactoEnum.ALIADO: [
        DetalleTipoEnum.ONG,
        DetalleTipoEnum.ENTIDAD_PUBLICA,
        DetalleTipoEnum.CAMARA_COMERCIO,
        DetalleTipoEnum.UNIVERSIDAD
    ],
    TipoContactoEnum.OTRO: [DetalleTipoEnum.OTRO]
}

class CategoriaEvaluacionEnum(str, Enum):
    # Proveedor
    CONFIABILIDAD = "Confiabilidad"
    CALIDAD_PRODUCTO = "Calidad del producto o servicio"
    PRECIO_BENEFICIO = "Precio / beneficio"
    PUNTUALIDAD_ENTREGAS = "Puntualidad en las entregas"
    SOPORTE_POSTVENTA = "Soporte postventa"
    COMUNICACION_PROVEEDOR = "Comunicación"

    # Cliente
    FACILIDAD_TRATO = "Facilidad de trato"
    NIVEL_COMPRAS = "Nivel de compras / recurrencia"
    POTENCIAL_FIDELIZACION = "Potencial de fidelización"
    COMUNICACION_CLIENTE = "Comunicación"
    CUMPLIMIENTO_PAGOS = "Cumplimiento de pagos"
    SATISFACCION_GENERAL = "Nivel de satisfacción general"

    # Empleado
    PUNTUALIDAD_EMPLEADO = "Puntualidad"
    PRODUCTIVIDAD = "Productividad"
    ACTITUD_COLABORACION = "Actitud / colaboración"
    ADAPTABILIDAD = "Adaptabilidad"
    CALIDAD_TRABAJO = "Calidad del trabajo"
    CUMPLIMIENTO_OBJETIVOS = "Cumplimiento de objetivos"

    # Externo
    PROFESIONALISMO = "Profesionalismo"
    CALIDAD_TECNICA = "Calidad técnica"
    CONFIDENCIALIDAD = "Confidencialidad"
    PUNTUALIDAD_EXTERNO = "Puntualidad"
    VALOR_ESTRATEGICO = "Valor estratégico"
    COORDINACION = "Facilidad de coordinación"

    # Socio
    COMPROMISO = "Nivel de compromiso"
    TRANSPARENCIA = "Transparencia"
    APORTE_ESTRATEGICO = "Aporte económico / estratégico"
    CONFIANZA_SOCIO = "Confianza"
    CUMPLIMIENTO_ACUERDOS = "Cumplimiento de acuerdos"
    VISION_COMPARTIDA = "Visión compartida"

    # Aliado
    INTERES_MUTUO = "Interés mutuo"
    ALINEACION = "Alineación institucional"
    BENEFICIO_MUTUO = "Beneficio para ambas partes"
    CALIDAD_COLABORACION = "Calidad de colaboración"
    PARTICIPACION = "Nivel de participación"
    COMUNICACION_ALIADO = "Comunicación"

    # Otro
    RELACION_GENERAL = "Relación general"
    INTERACCION = "Nivel de interacción"
    UTILIDAD_FUTURA = "Potencial utilidad futura"
    IMAGEN_PROFESIONAL = "Imagen profesional"
    CLARIDAD_COMUNICACION = "Claridad en comunicación"

    

# Mapeo de tipos de contacto a sus categorías de evaluación
TIPO_EVALUACION_MAPPING = {
    TipoContactoEnum.PROVEEDOR: [
        CategoriaEvaluacionEnum.CONFIABILIDAD,
        CategoriaEvaluacionEnum.CALIDAD_PRODUCTO,
        CategoriaEvaluacionEnum.PRECIO_BENEFICIO,
        CategoriaEvaluacionEnum.PUNTUALIDAD_ENTREGAS,
        CategoriaEvaluacionEnum.SOPORTE_POSTVENTA,
        CategoriaEvaluacionEnum.COMUNICACION_PROVEEDOR
    ],
    TipoContactoEnum.CLIENTE: [
        CategoriaEvaluacionEnum.FACILIDAD_TRATO,
        CategoriaEvaluacionEnum.NIVEL_COMPRAS,
        CategoriaEvaluacionEnum.POTENCIAL_FIDELIZACION,
        CategoriaEvaluacionEnum.COMUNICACION_CLIENTE,
        CategoriaEvaluacionEnum.CUMPLIMIENTO_PAGOS,
        CategoriaEvaluacionEnum.SATISFACCION_GENERAL
    ],
    TipoContactoEnum.EMPLEADO: [
        CategoriaEvaluacionEnum.PUNTUALIDAD_EMPLEADO,
        CategoriaEvaluacionEnum.PRODUCTIVIDAD,
        CategoriaEvaluacionEnum.ACTITUD_COLABORACION,
        CategoriaEvaluacionEnum.ADAPTABILIDAD,
        CategoriaEvaluacionEnum.CALIDAD_TRABAJO,
        CategoriaEvaluacionEnum.CUMPLIMIENTO_OBJETIVOS
    ],
    TipoContactoEnum.EXTERNO: [
        CategoriaEvaluacionEnum.PROFESIONALISMO,
        CategoriaEvaluacionEnum.CALIDAD_TECNICA,
        CategoriaEvaluacionEnum.CONFIDENCIALIDAD,
        CategoriaEvaluacionEnum.PUNTUALIDAD_EXTERNO,
        CategoriaEvaluacionEnum.VALOR_ESTRATEGICO,
        CategoriaEvaluacionEnum.COORDINACION
    ],
    TipoContactoEnum.SOCIO: [
        CategoriaEvaluacionEnum.COMPROMISO,
        CategoriaEvaluacionEnum.TRANSPARENCIA,
        CategoriaEvaluacionEnum.APORTE_ESTRATEGICO,
        CategoriaEvaluacionEnum.CONFIANZA_SOCIO,
        CategoriaEvaluacionEnum.CUMPLIMIENTO_ACUERDOS,
        CategoriaEvaluacionEnum.VISION_COMPARTIDA
    ],
    TipoContactoEnum.ALIADO: [
        CategoriaEvaluacionEnum.INTERES_MUTUO,
        CategoriaEvaluacionEnum.ALINEACION,
        CategoriaEvaluacionEnum.BENEFICIO_MUTUO,
        CategoriaEvaluacionEnum.CALIDAD_COLABORACION,
        CategoriaEvaluacionEnum.PARTICIPACION,
        CategoriaEvaluacionEnum.COMUNICACION_ALIADO
    ],
    TipoContactoEnum.OTRO: [
        CategoriaEvaluacionEnum.RELACION_GENERAL,
        CategoriaEvaluacionEnum.INTERACCION,
        CategoriaEvaluacionEnum.UTILIDAD_FUTURA,
        CategoriaEvaluacionEnum.IMAGEN_PROFESIONAL,
        CategoriaEvaluacionEnum.CLARIDAD_COMUNICACION
    ]
}