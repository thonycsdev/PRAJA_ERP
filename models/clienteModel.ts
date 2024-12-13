import { Cliente, PrismaClient, Prisma } from '@prisma/client';
import prisma from '../infra/database';
import { ErrorHandler } from 'utils/errorHandler';
import { Pagination } from 'types/pagination';

export class ClienteModel {
	private prismaClient: PrismaClient;
	constructor(prismaClient: PrismaClient) {
		this.prismaClient = prismaClient;
	}
	async criarCliente(cliente: Prisma.ClienteCreateInput) {
		if (!cliente) {
			throw new Error('O argumento do metodo "criarCliente" deve ser valido');
		}
		const result = await this.prismaClient.cliente.create({
			data: cliente
		});
		return result;
	}

	async buscarClientePorId(id: number) {
		const cliente = await this.prismaClient.cliente.findUnique({
			where: {
				id
			}
		});
		return cliente;
	}

	async buscarTodosClientes(
		pagination: Pagination = { page: 0, rowsPerPage: 10 }
	) {
		const skipAmount = pagination.page * pagination.rowsPerPage;
		const takeAmount = pagination.rowsPerPage;
		const clientes = await this.prismaClient.cliente.findMany({
			skip: skipAmount,
			take: takeAmount,
			where: {
				status: 'ACTIVE'
			}
		});

		const total = await this.prismaClient.cliente.count({
			where: {
				status: 'ACTIVE'
			}
		});
		return { clientes, total };
	}

	async atualizarCliente(cliente: Cliente) {
		if (!cliente) {
			throw new Error(
				'O argumento do metodo "atualizarCliente" deve ser valido'
			);
		}

		const payload: Prisma.ClienteCreateInput = { ...cliente };
		const result = await this.prismaClient.cliente.update({
			where: {
				id: cliente.id
			},
			data: payload
		});
		return result;
	}

	async deletarCliente(id: number) {
		try {
			const cliente = await this.prismaClient.cliente.delete({
				where: {
					id
				}
			});
			return cliente;
		} catch {
			throw new Error('Cliente nao deletado, id nao encontrado');
		}
	}

	async buscarClientePorEmail(email: string) {
		try {
			const cliente = await this.prismaClient.cliente.findFirstOrThrow({
				where: {
					email
				}
			});
			return cliente;
		} catch {
			throw new Error('Cliente nao encontrado com esse email');
		}
	}
	async buscarClientesPorNome(name: string) {
		try {
			const clientes = await this.prismaClient.cliente.findFirstOrThrow({
				where: {
					name
				}
			});
			return clientes;
		} catch {
			throw new Error('Nenhum cliente encontrado com esse nome');
		}
	}

	async buscarClientePorTelefone(phoneNumber: string) {
		try {
			const cliente = await this.prismaClient.cliente.findFirstOrThrow({
				where: {
					phoneNumber
				}
			});
			return cliente;
		} catch {
			throw new Error('Cliente nao encontrado com esse telefone');
		}
	}

	async deactivate(clienteId: number) {
		const cliente = await this.buscarClientePorId(clienteId);
		if (!cliente) {
			const erro = ErrorHandler.create(
				new Error('Cliente nao encontrado'),
				404
			);
			throw erro;
		}

		try {
			const result = await this.prismaClient.cliente.update({
				where: {
					id: clienteId
				},
				data: {
					status: 'INACTIVE'
				}
			});
			return result;
		} catch (error) {
			const erroHandler = ErrorHandler.create(error, 500);
			throw erroHandler;
		}
	}

	async activate(clienteId: number) {
		const cliente = await this.buscarClientePorId(clienteId);
		if (!cliente) {
			const erro = ErrorHandler.create(
				new Error('Cliente nao encontrado'),
				404
			);
			throw erro;
		}

		try {
			const result = await this.prismaClient.cliente.update({
				where: {
					id: clienteId
				},
				data: {
					status: 'ACTIVE'
				}
			});
			return result;
		} catch (error) {
			const erroHandler = ErrorHandler.create(error, 500);
			throw erroHandler;
		}
	}
}

export const clienteModel = new ClienteModel(prisma);
