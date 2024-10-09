import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PRODUCT_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { firstValueFrom } from 'rxjs';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { name } = createProductDto;
    try {
      const product = await firstValueFrom(
        this.productsClient.send({ cmd: 'create_product' }, createProductDto),
      );

      return {
        message: `The product with the name ${name} was created successfully`,
        product,
      };
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get()
  async findAll(@Query() paginationPayload: PaginationDto) {
    try {
      const products = await firstValueFrom(
        this.productsClient.send(
          { cmd: 'find_all_products' },
          paginationPayload,
        ),
      );

      return products;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const product = await firstValueFrom(
        this.productsClient.send({ cmd: 'find_one_product' }, { id }),
      );

      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      const product = await firstValueFrom(
        this.productsClient.send(
          { cmd: 'update_product' },
          { id, ...updateProductDto },
        ),
      );
      return product;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return 'Returns a message indicating the result of the deletion';
  }
}
