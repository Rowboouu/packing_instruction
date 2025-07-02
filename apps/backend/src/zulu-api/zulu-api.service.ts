import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { writeFile } from 'fs/promises';
import { ConfigSchemaType } from 'src/common/config.schema';
import { ZuluAssortment, ZuluSalesOrder } from './zulu-types';

@Injectable()
export class ZuluApiService {
  private readonly logger = new Logger(ZuluApiService.name);

  constructor(
    private readonly configService: ConfigService<ConfigSchemaType>,
  ) {
    this.logger.log('ZuluApiService initialized with MOCK DATA');
  }

  async authenticate() {
    // Return mock authentication data
    const mockAuthData = {
      result: {
        'web.base.url': 'http://mock-zulu-api.com',
        username: 'mock-user',
        db: 'mock-database',
        session_id: 'mock-session-' + randomBytes(8).toString('hex'),
      }
    };

    this.logger.debug(
      '++++++++++ Mock Authentication Success ++++++++++',
      `host: ${mockAuthData.result['web.base.url']}`,
      `user: ${mockAuthData.result.username}`,
      `database: ${mockAuthData.result.db}`,
      `session: ${mockAuthData.result.session_id}`,
    );

    return mockAuthData;
  }

  async checkHealth() {
    return {
      status: 'ok',
      message: 'Mock Zulu API is healthy',
      timestamp: new Date().toISOString(),
    };
  }

  async getSalesOrders(): Promise<ZuluSalesOrder[]> {
    // Return mock sales orders matching the actual Zulu structure
    const mockSalesOrders: ZuluSalesOrder[] = [
      {
        id: 1001,
        name: 'SO-2024-001',
        partner_id: [501, 'ABC Electronics Ltd'],
        customer_po_number: 'PO-ABC-2024-001',
        order_line: [1, 2, 3],
        promised_delivery_date: '2024-02-15',
        state: 'sale'
      },
      {
        id: 1002,
        name: 'SO-2024-002',
        partner_id: [502, 'Tech Innovations Inc'],
        customer_po_number: 'PO-TECH-2024-002',
        order_line: [4, 5],
        promised_delivery_date: '2024-02-20',
        state: 'draft'
      },
      {
        id: 1003,
        name: 'SO-2024-003',
        partner_id: [503, 'Global Retail Chain'],
        customer_po_number: 'PO-GLOBAL-2024-003',
        order_line: [6, 7, 8, 9],
        promised_delivery_date: false,
        state: 'done'
      },
      {
        id: 1004,
        name: 'SO-2024-004',
        partner_id: [504, 'Digital Solutions Corp'],
        customer_po_number: 'PO-DIGITAL-2024-004',
        order_line: [10, 11],
        promised_delivery_date: '2024-03-01',
        state: 'sent'
      },
      {
        id: 1005,
        name: 'SO-2024-005',
        partner_id: [505, 'Future Electronics Co'],
        customer_po_number: 'PO-FUTURE-2024-005',
        order_line: [12, 13, 14],
        promised_delivery_date: '2024-03-10',
        state: 'cancel'
      }
    ];

    this.logger.debug(`Returning ${mockSalesOrders.length} mock sales orders`);
    return mockSalesOrders;
  }

  async getAssortments(): Promise<ZuluAssortment[]> {
    // Return mock assortments matching the actual Zulu structure
    const mockAssortments: ZuluAssortment[] = [
      {
        id: 2001,
        name: 'Wireless Headphones Pro',
        item_number_search: 'WHP-PRO-001',
        product_id: [3001, 'Wireless Headphones Pro - Black'],
        order_id: [1001, 'SO-2024-001'],
        customer_item_number: 'CUST-WHP-001',
        master_cuft_st: '2.5',
        master_gross_weight_lbs_st: '15.2',
        products_in_carton_st: 10,
        products_per_unit_st: 1,
        labels: [
          {
            'main_label': { id: 1, name: 'Product Label', value: 'Wireless Headphones Pro' },
            'barcode': { id: 2, name: 'Barcode', value: '123456789012' },
            'size_label': { id: 3, name: 'Size', value: 'Standard' }
          }
        ]
      },
      {
        id: 2002,
        name: 'Bluetooth Speaker Premium',
        item_number_search: 'BSP-PREM-002',
        product_id: [3002, 'Bluetooth Speaker Premium - Silver'],
        order_id: [1002, 'SO-2024-002'],
        customer_item_number: false,
        master_cuft_st: '4.8',
        master_gross_weight_lbs_st: '22.7',
        products_in_carton_st: 6,
        products_per_unit_st: 1,
        labels: [
          {
            'main_label': { id: 4, name: 'Product Label', value: 'Bluetooth Speaker Premium' },
            'barcode': { id: 5, name: 'Barcode', value: '234567890123' },
            'warranty_label': { id: 6, name: 'Warranty', value: '2 Year Limited' }
          }
        ]
      },
      {
        id: 2003,
        name: 'Smart Watch Series X',
        item_number_search: 'SWX-001',
        product_id: [3003, 'Smart Watch Series X - Space Gray'],
        order_id: [1003, 'SO-2024-003'],
        customer_item_number: 'CUST-SW-X001',
        master_cuft_st: '1.2',
        master_gross_weight_lbs_st: '8.5',
        products_in_carton_st: 20,
        products_per_unit_st: 1,
        labels: [
          {
            'main_label': { id: 7, name: 'Product Label', value: 'Smart Watch Series X' },
            'barcode': { id: 8, name: 'Barcode', value: '345678901234' },
            'size_label': { id: 9, name: 'Size', value: '42mm' },
            'color_label': { id: 10, name: 'Color', value: 'Space Gray' }
          }
        ]
      },
      {
        id: 2004,
        name: 'Tablet Pro 11-inch',
        item_number_search: 'TAB-PRO-11',
        product_id: [3004, 'Tablet Pro 11-inch - WiFi 256GB'],
        order_id: [1004, 'SO-2024-004'],
        customer_item_number: 'CUST-TAB-PRO11',
        master_cuft_st: false,
        master_gross_weight_lbs_st: false,
        products_in_carton_st: 4,
        products_per_unit_st: 1,
        labels: [
          {
            'main_label': { id: 11, name: 'Product Label', value: 'Tablet Pro 11-inch' },
            'barcode': { id: 12, name: 'Barcode', value: '456789012345' },
            'storage_label': { id: 13, name: 'Storage', value: '256GB' },
            'connectivity_label': { id: 14, name: 'Connectivity', value: 'WiFi' }
          }
        ]
      },
      {
        id: 2005,
        name: 'Gaming Keyboard RGB',
        item_number_search: 'GKB-RGB-001',
        product_id: [3005, 'Gaming Keyboard RGB - Mechanical'],
        order_id: [1005, 'SO-2024-005'],
        customer_item_number: false,
        master_cuft_st: '3.1',
        master_gross_weight_lbs_st: '18.9',
        products_in_carton_st: 8,
        products_per_unit_st: 1,
        labels: [
          {
            'main_label': { id: 15, name: 'Product Label', value: 'Gaming Keyboard RGB' },
            'barcode': { id: 16, name: 'Barcode', value: '567890123456' },
            'switch_type': { id: 17, name: 'Switch Type', value: 'Mechanical Blue' },
            'feature_label': { id: 18, name: 'Features', value: 'RGB Backlit' }
          }
        ]
      }
    ];

    this.logger.debug(`Returning ${mockAssortments.length} mock assortments`);
    return mockAssortments;
  }

  async getCustomers(keyword?: string, per_page: number = 10, page: number = 1) {
    // Return mock customers
    const allCustomers = [
      {
        id: 501,
        name: 'ABC Electronics Ltd',
        email: 'contact@abc-electronics.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        country: 'United States',
        total_orders: 45,
        total_spent: 125000.00
      },
      {
        id: 502,
        name: 'Tech Innovations Inc',
        email: 'sales@techinnovations.com',
        phone: '+1-555-0456',
        address: '456 Innovation Blvd, Austin, TX 78701',
        country: 'United States',
        total_orders: 23,
        total_spent: 87500.00
      },
      {
        id: 503,
        name: 'Global Retail Chain',
        email: 'procurement@globalretail.com',
        phone: '+1-555-0789',
        address: '789 Retail Plaza, New York, NY 10001',
        country: 'United States',
        total_orders: 156,
        total_spent: 450000.00
      },
      {
        id: 504,
        name: 'Digital Solutions Corp',
        email: 'orders@digitalsolutions.com',
        phone: '+1-555-0321',
        address: '321 Digital Way, Seattle, WA 98101',
        country: 'United States',
        total_orders: 67,
        total_spent: 234000.00
      },
      {
        id: 505,
        name: 'Future Electronics Co',
        email: 'info@futureelectronics.com',
        phone: '+1-555-0654',
        address: '654 Future Drive, Denver, CO 80201',
        country: 'United States',
        total_orders: 89,
        total_spent: 178000.00
      }
    ];

    // Filter by keyword if provided
    let filteredCustomers = allCustomers;
    if (keyword) {
      const searchTerm = keyword.toLowerCase();
      filteredCustomers = allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm)
      );
    }

    // Paginate results
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    this.logger.debug(`Returning ${paginatedCustomers.length} mock customers (page ${page})`);

    return {
      data: paginatedCustomers,
      meta: {
        total: filteredCustomers.length,
        per_page,
        current_page: page,
        last_page: Math.ceil(filteredCustomers.length / per_page),
      }
    };
  }

  async getPartner(id: number) {
    const mockPartners = [
      {
        id: 501,
        name: 'ABC Electronics Ltd',
        full_details: {
          company_registration: 'REG-ABC-2019',
          tax_id: 'TAX-123456789',
          established_date: '2019-03-15',
          website: 'https://abc-electronics.com'
        }
      },
      {
        id: 502,
        name: 'Tech Innovations Inc',
        full_details: {
          company_registration: 'REG-TECH-2020',
          tax_id: 'TAX-987654321',
          established_date: '2020-07-22',
          website: 'https://techinnovations.com'
        }
      }
    ];

    const partner = mockPartners.find(p => p.id === id);
    if (!partner) {
      throw new Error(`Partner with id ${id} not found`);
    }

    this.logger.debug(`Returning mock partner data for id: ${id}`);
    return [partner]; // Return as array to match original API
  }

  async getImageData(id: number): Promise<any> {
    try {
      // Create a simple placeholder image (1x1 pixel PNG)
      const placeholderImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      );

      const destination = 'uploads/assortments/';
      const filename = `mock-image-${id}-${randomBytes(8).toString('hex')}.png`;
      const filePath = `${destination}${filename}`;
      
      // Make sure the directory exists
      await writeFile(process.cwd() + '/' + filePath, placeholderImageBuffer);

      this.logger.debug(`Created mock image for product id: ${id}`);

      return {
        originalname: `product-${id}.png`,
        destination: './' + destination,
        encoding: 'base64',
        mimetype: 'image/png',
        filename: filename,
        path: filePath,
        size: placeholderImageBuffer.length,
      };
    } catch (error) {
      this.logger.error('Error creating mock image:', error);
      throw new Error(`Failed to create mock image for product ${id}`);
    }
  }
}