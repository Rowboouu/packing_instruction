import { Injectable } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { ZuluApiService } from 'src/zulu-api/zulu-api.service';
import { ZuluAssortmentsService } from 'src/zulu-assortments/zulu-assortments.service';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';

@Injectable()
export class SeedersService {
  constructor(
    private zuluApiService: ZuluApiService,
    private zuluSalesOrderService: ZuluSalesOrdersService,
    private zuluAssortmentsService: ZuluAssortmentsService,
    private filesService: FilesService,
  ) {}

  async handleUpsertSaleOrder() {
    const res = await this.zuluApiService.getSalesOrders();
    const items = res.map((order) => {
      return {
        customerPoNo: order.customer_po_number,
        name: order.name,
        orderId: order.id,
        orderLines: order.order_line,
        partnerId: order.partner_id[0],
        etd: order.promised_delivery_date ? order.promised_delivery_date : null,
        state: order.state,
      };
    });
    return this.zuluSalesOrderService.bulkUpsert(items);
  }

  async handleUpsertAssortments() {
    const res = await this.zuluApiService.getAssortments();

    const items = res.map((item) => {
      return {
        name: item.name,
        orderItemId: item.id,
        itemNo: item.item_number_search,
        customerItemNo: item.customer_item_number || null,
        productId: item.product_id[0],
        orderId: item.order_id[0],
        productInCarton: item.products_in_carton_st || 0,
        productPerUnit: item.products_per_unit_st || 0,
        masterCUFT: item.master_cuft_st || null,
        masterGrossWeight: item.master_gross_weight_lbs_st || null,
        labels: item.labels,
      };
    });

    return this.zuluAssortmentsService.bulkUpsert(items);
  }

  async handleUpdateImages() {
    const res = await this.zuluAssortmentsService.findAll({
      image: { $exists: false },
    });
    const bulkItems = [];
    for (const item of res) {
      if (!item.image) {
        const file = await this.zuluApiService.getImageData(item.productId);
        const result = await this.filesService.create(file);
        bulkItems.push({ _id: item._id, image: result._id });
      }
    }
    return this.zuluAssortmentsService.customBulkUpsert(bulkItems);
  }
}
