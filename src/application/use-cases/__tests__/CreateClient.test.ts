import { CreateClient } from '../CreateClient';
import { Client } from '../../../domain/entities/Client';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { ClientAlreadyExistsError } from '../../../domain/entities/ClientAlreadyExitsError';

describe('CreateClient', () => {
  let createClient: CreateClient;
  let mockClientRepository: jest.Mocked<ClientRepository>;

  beforeEach(() => {
    mockClientRepository = {
      findByIdentification: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      updatePartial: jest.fn(),
      findById: jest.fn()
    } as jest.Mocked<ClientRepository>;

    createClient = new CreateClient(mockClientRepository);
  });

  it('should create a new client successfully', async () => {
    // Arrange
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: new Date('1990-01-01'),
      contact: '1234567890',
      comment: 'Test client'
    };

    mockClientRepository.findByIdentification.mockResolvedValue(null);
    mockClientRepository.save.mockResolvedValue(new Client(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    ));

    // Act
    const result = await createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    );

    // Assert
    expect(mockClientRepository.findByIdentification).toHaveBeenCalledWith(clientData.identification);
    expect(mockClientRepository.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Client);
    expect(result.name).toBe(clientData.name);
    expect(result.lastName).toBe(clientData.lastName);
    expect(result.email).toBe(clientData.email);
    expect(result.identification).toBe(clientData.identification);
  });

  it('should throw ClientAlreadyExistsError when client with same identification exists', async () => {
    // Arrange
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: new Date('1990-01-01'),
      contact: '1234567890',
      comment: 'Test client'
    };

    const existingClient = new Client(
      'Existing',
      'Client',
      'existing@example.com',
      clientData.identification,
      new Date('1990-01-01'),
      '9876543210',
      'Existing client'
    );

    mockClientRepository.findByIdentification.mockResolvedValue(existingClient);

    // Act & Assert
    await expect(createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    )).rejects.toThrow(ClientAlreadyExistsError);
  });

  it('should throw error when repository save fails', async () => {
    // Arrange
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: new Date('1990-01-01'),
      contact: '1234567890',
      comment: 'Test client'
    };

    mockClientRepository.findByIdentification.mockResolvedValue(null);
    mockClientRepository.save.mockRejectedValue(new Error('Database error'));

    // Act & Assert
    await expect(createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    )).rejects.toThrow('Failed to create client: Database error');
  });

  it('should handle empty strings in optional fields', async () => {
    // Arrange
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: new Date('1990-01-01'),
      contact: '1234567890',
      comment: '' // Empty comment
    };

    mockClientRepository.findByIdentification.mockResolvedValue(null);
    mockClientRepository.save.mockResolvedValue(new Client(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    ));

    // Act
    const result = await createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    );

    // Assert
    expect(result.comment).toBe('');
  });

  it('should handle special characters in client data', async () => {
    // Arrange
    const clientData = {
      name: 'José',
      lastName: 'García-López',
      email: 'jose.garcia-lopez@example.com',
      identification: '123-456-789',
      birthdate: new Date('1990-01-01'),
      contact: '+1 (555) 123-4567',
      comment: 'Cliente VIP - ¡Importante!'
    };

    mockClientRepository.findByIdentification.mockResolvedValue(null);
    mockClientRepository.save.mockResolvedValue(new Client(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    ));

    // Act
    const result = await createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    );

    // Assert
    expect(result.name).toBe(clientData.name);
    expect(result.lastName).toBe(clientData.lastName);
    expect(result.email).toBe(clientData.email);
    expect(result.identification).toBe(clientData.identification);
    expect(result.contact).toBe(clientData.contact);
    expect(result.comment).toBe(clientData.comment);
  });

  it('should handle repository findByIdentification error', async () => {
    // Arrange
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: new Date('1990-01-01'),
      contact: '1234567890',
      comment: 'Test client'
    };

    mockClientRepository.findByIdentification.mockRejectedValue(new Error('Database connection error'));

    // Act & Assert
    await expect(createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    )).rejects.toThrow('Failed to create client: Database connection error');
  });

  it('should handle future birthdate', async () => {
    // Arrange
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    const clientData = {
      name: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      identification: '123456789',
      birthdate: futureDate,
      contact: '1234567890',
      comment: 'Test client'
    };

    mockClientRepository.findByIdentification.mockResolvedValue(null);
    mockClientRepository.save.mockResolvedValue(new Client(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    ));

    // Act
    const result = await createClient.execute(
      clientData.name,
      clientData.lastName,
      clientData.email,
      clientData.identification,
      clientData.birthdate,
      clientData.contact,
      clientData.comment
    );

    // Assert
    expect(result.birthdate).toEqual(futureDate);
  });
}); 