export const openApiDocument: Record<string, unknown> = {
    openapi: '3.1.0',
    info: {
        title: 'Task API Express',
        version: '1.0.0',
        description:
            'API REST para gestionar tareas con autenticación JWT y autorización por roles.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Entorno local'
        }
    ],
    tags: [
        { name: 'Health', description: 'Comprobación del servicio' },
        { name: 'Auth', description: 'Registro, acceso e identidad autenticada' },
        { name: 'Tasks', description: 'CRUD protegido de tareas' }
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Comprobar que la API responde',
                responses: {
                    '200': {
                        description: 'Servicio disponible',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['data'],
                                    properties: {
                                        data: {
                                            type: 'object',
                                            required: ['status'],
                                            properties: { status: { type: 'string', example: 'up' } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/health/database': {
            get: {
                tags: ['Health'],
                summary: 'Comprobar el estado de la conexión con MongoDB',
                responses: {
                    '200': {
                        description: 'Base de datos conectada',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['data'],
                                    properties: {
                                        data: {
                                            type: 'object',
                                            required: ['status'],
                                            properties: { status: { type: 'string', const: 'up' } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '503': {
                        description: 'Base de datos no disponible',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['data'],
                                    properties: {
                                        data: {
                                            type: 'object',
                                            required: ['status'],
                                            properties: { status: { type: 'string', const: 'down' } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar una cuenta de usuario',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterInput' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Cuenta creada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserEnvelope' }
                            }
                        }
                    },
                    '409': { $ref: '#/components/responses/Conflict' },
                    '415': { $ref: '#/components/responses/UnsupportedMediaType' },
                    '422': { $ref: '#/components/responses/ValidationError' },
                    '429': { $ref: '#/components/responses/RateLimited' }
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesión y obtener un access token',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginInput' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Credenciales correctas',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginEnvelope' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '415': { $ref: '#/components/responses/UnsupportedMediaType' },
                    '422': { $ref: '#/components/responses/ValidationError' },
                    '429': { $ref: '#/components/responses/RateLimited' }
                }
            }
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Obtener el usuario asociado al token',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Identidad autenticada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/UserEnvelope' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/api/tasks': {
            get: {
                tags: ['Tasks'],
                summary: 'Listar tareas con paginación, filtros y ordenamiento',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' },
                    { $ref: '#/components/parameters/Status' },
                    { $ref: '#/components/parameters/Search' },
                    { $ref: '#/components/parameters/SortBy' },
                    { $ref: '#/components/parameters/Order' }
                ],
                responses: {
                    '200': {
                        description: 'Lista paginada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskListResult' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '422': { $ref: '#/components/responses/ValidationError' }
                }
            },
            post: {
                tags: ['Tasks'],
                summary: 'Crear una tarea',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreateTaskInput' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Tarea creada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskEnvelope' }
                            }
                        }
                    }, '401': { $ref: '#/components/responses/Unauthorized' },
                    '415': { $ref: '#/components/responses/UnsupportedMediaType' },
                    '422': { $ref: '#/components/responses/ValidationError' }
                }
            }
        },
        '/api/tasks/{id}': {
            parameters: [{ $ref: '#/components/parameters/TaskId' }],
            get: {
                tags: ['Tasks'],
                summary: 'Consultar una tarea',
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Tarea encontrada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskEnvelope' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '422': { $ref: '#/components/responses/ValidationError' }
                }
            },
            patch: {
                tags: ['Tasks'],
                summary: 'Modificar título o estado de una tarea',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateTaskInput' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Tarea modificada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskEnvelope' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '415': { $ref: '#/components/responses/UnsupportedMediaType' },
                    '422': { $ref: '#/components/responses/ValidationError' }
                }
            },
            delete: {
                tags: ['Tasks'],
                summary: 'Eliminar una tarea como administrador',
                security: [{ bearerAuth: [] }],
                responses: {
                    '204': { description: 'Tarea eliminada' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                    '422': { $ref: '#/components/responses/ValidationError' }
                }
            }
        },
        '/api/tasks/{id}/complete': {
            patch: {
                tags: ['Tasks'],
                summary: 'Marcar una tarea como completada',
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/TaskId' }],
                responses: {
                    '200': {
                        description: 'Tarea completada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskEnvelope' }
                            }
                        }
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '404': { $ref: '#/components/responses/NotFound' }, '422': { $ref: '#/components/responses/ValidationError' }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        parameters: {
            TaskId: {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
            },
            Page: {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', minimum: 1, default: 1 }
            },
            Limit: {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
            },
            Status: {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['pending', 'completed'] }
            },
            Search: {
                name: 'search',
                in: 'query',
                schema: { type: 'string', maxLength: 80 }
            },
            SortBy: {
                name: 'sortBy',
                in: 'query',
                schema: {
                    type: 'string',
                    enum: ['title', 'status', 'createdAt', 'updatedAt'],
                    default: 'createdAt'
                }
            },
            Order: {
                name: 'order',
                in: 'query',
                schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
            }
        },
        schemas: {
            User: {
                type: 'object',
                required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
                properties: {
                    id: { type: 'string', example: '67112bfe47963b2be12c43a1' },
                    name: { type: 'string', example: 'Ana Torres' },
                    email: { type: 'string', format: 'email', example: 'ana@example.com' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Task: {
                type: 'object',
                required: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
                properties: {
                    id: { type: 'string', example: '67112bfe47963b2be12c43a2' },
                    title: { type: 'string', example: 'Documentar la API' },
                    status: { type: 'string', enum: ['pending', 'completed'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            RegisterInput: {
                type: 'object',
                required: ['name', 'email', 'password'],
                additionalProperties: false, properties: {
                    name: { type: 'string', minLength: 2, maxLength: 80 },
                    email: { type: 'string', format: 'email', maxLength: 254 },
                    password: { type: 'string', minLength: 15, format: 'password' }
                }
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'password'],
                additionalProperties: false,
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' }
                }
            },
            CreateTaskInput: {
                type: 'object',
                required: ['title'],
                additionalProperties: false,
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 120 }
                }
            },
            UpdateTaskInput: {
                type: 'object',
                minProperties: 1,
                additionalProperties: false,
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 120 },
                    status: { type: 'string', enum: ['pending', 'completed'] }
                }
            },
            ErrorDetail: {
                type: 'object',
                additionalProperties: true,
                properties: {
                    field: { type: 'string' },
                    message: { type: 'string' }
                }
            },
            ApiError: {
                type: 'object',
                required: ['code', 'message'],
                properties: {
                    code: { type: 'string', example: 'VALIDATION_ERROR' },
                    message: { type: 'string', example: 'La solicitud contiene datos inválidos.' },
                    details: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ErrorDetail' }
                    },
                    requestId: { type: 'string', format: 'uuid' }
                }
            },
            ErrorEnvelope: {
                type: 'object',
                required: ['error'],
                properties: { error: { $ref: '#/components/schemas/ApiError' } }
            },
            UserEnvelope: {
                type: 'object',
                required: ['data'],
                properties: {
                    data: {
                        type: 'object',
                        required: ['user'],
                        properties: { user: { $ref: '#/components/schemas/User' } }
                    }
                }
            },
            LoginEnvelope: {
                type: 'object',
                required: ['data'],
                properties: {
                    data: {
                        type: 'object',
                        required: ['user', 'accessToken', 'tokenType', 'expiresIn'],
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                            accessToken: { type: 'string' },
                            tokenType: { type: 'string', const: 'Bearer' },
                            expiresIn: { type: 'string', example: '1h' }
                        }
                    }
                }
            },
            TaskEnvelope: {
                type: 'object',
                required: ['data'],
                properties: { data: { $ref: '#/components/schemas/Task' } }
            },
            PaginationMeta: {
                type: 'object',
                required: [
                    'page',
                    'limit',
                    'total',
                    'totalPages',
                    'hasNextPage',
                    'hasPreviousPage'
                ],
                properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    hasNextPage: { type: 'boolean' },
                    hasPreviousPage: { type: 'boolean' }
                }
            },
            TaskListResult: {
                type: 'object',
                required: ['data', 'meta'],
                properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    meta: { $ref: '#/components/schemas/PaginationMeta' }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: 'Token ausente, inválido, vencido o sin cuenta asociada',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            Forbidden: {
                description: 'El rol autenticado no tiene permiso',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            NotFound: {
                description: 'Recurso inexistente',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            Conflict: {
                description: 'Conflicto con un recurso existente',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            UnsupportedMediaType: {
                description: 'El cuerpo no utiliza application/json',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            ValidationError: {
                description: 'Parámetros, cuerpo o identificador inválidos',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            },
            RateLimited: {
                description: 'Se superó el límite temporal de autenticación',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorEnvelope' }
                    }
                }
            }
        }
    }
};