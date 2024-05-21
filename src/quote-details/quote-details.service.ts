import { Injectable, NotFoundException, BadRequestException, ConsoleLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

import { CreateQuoteDetailDto } from './dto/create-quote-detail.dto';
import { UpdateQuoteDetailDto } from './dto/update-quote-detail.dto';
import { QuoteDetail } from './entities/quote-detail.entity';
import { CartQuote } from '../cart-quotes/entities/cart-quote.entity';
import { Product } from '../products/entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MarkingService } from '../marking-services/entities/marking-service.entity';
import { MarkedServicePrice } from '../marked-service-prices/entities/marked-service-price.entity';
import { Packing } from '../packings/entities/packing.entity';
import { RefProduct } from '../ref-products/entities/ref-product.entity';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { MarkingServiceProperty } from '../marking-service-properties/entities/marking-service-property.entity';
import { Marking } from '../markings/entities/marking.entity';
import { SystemConfig } from '../system-configs/entities/system-config.entity';
import { LocalTransportPrice } from '../local-transport-prices/entities/local-transport-price.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { DeliveryTime } from '../delivery-times/entities/delivery-time.entity';
import { CategorySupplier } from '../category-suppliers/entities/category-supplier.entity';
import { CategoryTag } from 'src/category-tag/entities/category-tag.entity';
import { FinancingCostProfit } from 'src/financing-cost-profits/entities/financing-cost-profit.entity';
import { DiscountQuoteDetailDto } from './dto/discount-price.dto';
import { Logo } from 'src/logos/entities/logo.entity';
import axios from 'axios';
// import { Log } from 'src/logos/entities/logo.entity';

@Injectable()
export class QuoteDetailsService {
  constructor(
    @InjectRepository(QuoteDetail)
    private readonly quoteDetailRepository: Repository<QuoteDetail>,

    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(CategorySupplier)
    private readonly categorySupplierRepository: Repository<CategorySupplier>,

    @InjectRepository(CategoryTag)
    private readonly categoryTagRepository: Repository<CategoryTag>,

    @InjectRepository(CartQuote)
    private readonly cartQuoteRepository: Repository<CartQuote>,

    @InjectRepository(LocalTransportPrice)
    private readonly localTransportPriceRepository: Repository<LocalTransportPrice>,

    @InjectRepository(MarkingService)
    private readonly markingServiceRepository: Repository<MarkingService>,

    @InjectRepository(MarkingServiceProperty)
    private readonly markingServicePropertyRepository: Repository<MarkingServiceProperty>,

    @InjectRepository(Logo)
    private readonly LogoService: Repository<Logo>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,

    @InjectRepository(FinancingCostProfit)
    private readonly systemFinancingCostProfit: Repository<FinancingCostProfit>,
  ) { }





  // FUNCIÓN PARA OBTENER TOKEN DE FEDEX
  async obtenerTokenFedex() {
    const apiUrl = 'https://apis.fedex.com/oauth/token';
    const clientId = 'l779bf82d2325e4925bc2b2f3a4a89b8fe';
    const clientSecret = 'b2e9c072764849d7bd645066234e00aa';
    const grantType = 'client_credentials';
    const customerId = ''; // Si no se necesita, dejar vacío

    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('grant_type', grantType);
    if (customerId) {
      formData.append('client_id', customerId);
    }

    try {
      const response = await axios.post(apiUrl, formData);
      const token = response.data.access_token;
      return token; // Devuelve el token obtenido
    } catch (error) {
      console.error('Error al obtener el token de FedEx:', error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  };


  // FUNCIÓN PARA OBTENER INFORMACIÓN DE ENVIO DE FEDEX
  async enviarSolicitudRateQuotes(token, accountNumber, shipperPostalCode, shipperCountryCode, recipientPostalCode, recipientCountryCode, pickupType, rateRequestType, packageLineItems) {
    console.log(JSON.stringify({ token, accountNumber, shipperPostalCode, shipperCountryCode, recipientPostalCode, recipientCountryCode, pickupType, rateRequestType, packageLineItems }))

    const apiUrl = 'https://apis.fedex.com/rate/v1/rates/quotes';

    const payload = {
      accountNumber: { value: accountNumber },
      requestedShipment: {
        shipper: { address: { postalCode: shipperPostalCode, countryCode: shipperCountryCode } },
        recipient: { address: { postalCode: recipientPostalCode, countryCode: recipientCountryCode } },
        pickupType: pickupType,
        rateRequestType: rateRequestType,
        requestedPackageLineItems: packageLineItems
      }
    };

    console.log(payload)


    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios.post(apiUrl, payload, config);
      console.log(response)
      return response.data;
    } catch (error) {
      console.error('Error al enviar la solicitud de rate quotes a FedEx:', error);
      throw error;
    }
  };

  // Función para obtener el valor de totalNetFedExCharge de la respuesta
  obtenerTotalNetFedExCharge(respuesta) {
    const { rateReplyDetails } = respuesta.output;
    if (rateReplyDetails && rateReplyDetails.length > 0) {
      const primerDetalle = rateReplyDetails[0];
      if (primerDetalle.ratedShipmentDetails && primerDetalle.ratedShipmentDetails.length > 0) {
        const primerDetalleShipment = primerDetalle.ratedShipmentDetails[0];
        return primerDetalleShipment.totalNetFedExCharge;
      }
    }
    return null; // Si no se encuentra el valor, retorna null o puedes manejarlo según tus necesidades.
  };

  calcularPreciosFedex(tokenFedeex, condigoPostalCliente, postalCode, boxesQuantity, large, width, height) {
    return new Promise((resolve, reject) => {
      const token = tokenFedeex;
      const accountNumber = '781540595';
      const shipperPostalCode = condigoPostalCliente; // Codigo postal cliente 
      const shipperCountryCode = 'CO';
      const recipientPostalCode = postalCode; // Codigo postal del proveedor de marcado
      const recipientCountryCode = 'CO';
      const pickupType = 'DROPOFF_AT_FEDEX_LOCATION';
      const rateRequestType = ['LIST', 'ACCOUNT'];
      const packageLineItems = [
        {
          groupPackageCount: boxesQuantity, // Cantidad de cajas del paquete
          weight: { units: 'KG', value: 1.42 },
          dimensions: { length: large, width: width, height: height, units: 'CM' }
        }
      ];

      this.enviarSolicitudRateQuotes(token, accountNumber, shipperPostalCode, shipperCountryCode, recipientPostalCode, recipientCountryCode, pickupType, rateRequestType, packageLineItems)
        .then(data => {
          console.log(data);
          // Aquí puedes manejar la respuesta de FedEx según tus necesidades
          const TransportPricesMarkingFedex = this.obtenerTotalNetFedExCharge(data) || 0; // Utiliza la función que definiste para obtener el netFedExCharge
          console.log(TransportPricesMarkingFedex);
          resolve(TransportPricesMarkingFedex);
          // Aquí puedes manejar la respuesta de FedEx según tus necesidades
        })
        .catch(error => {
          // Maneja el error si ocurre alguno al enviar la solicitud
          console.error('Error al enviar la solicitud de rate quotes a FedEx:', error);
          reject(error);
        });
    });
  }



  async create(createQuoteDetailDto: CreateQuoteDetailDto, user: User) {
    const hasSample: boolean = createQuoteDetailDto.hasSample;

    delete (createQuoteDetailDto.hasSample);

    const newQuoteDetail: QuoteDetail = plainToClass(QuoteDetail, createQuoteDetailDto);

    newQuoteDetail.createdBy = user.id;

    const cartQuote: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: createQuoteDetailDto.cartQuote,
      },
      relations: [
        'client',
        'client.user',
        'client.user.company',
        'client.user.brands',
      ],
    });


    let condigoPostalCliente = cartQuote?.client?.user?.company?.postalCode;
    console.log(condigoPostalCliente)


    if (!cartQuote)
      throw new NotFoundException(`Cart quote with id ${createQuoteDetailDto} not found`);

    // Obtendi la información del Producto
    const product: Product = await this.productRepository.findOne({
      where: {
        id: createQuoteDetailDto.product,
      },
      relations: [
        'packings',
        'refProduct',
        'refProduct.packings',
        'refProduct.supplier',
        'refProduct.supplier.disccounts',
        'refProduct.supplier.disccounts.disccounts',
      ],
    });

    console.log(product)

    if (!product)
      throw new NotFoundException(`Product with id ${createQuoteDetailDto.product} not found`);

    newQuoteDetail.cartQuote = cartQuote;
    newQuoteDetail.product = product;

    let markingTotalPrice: number = 0;

    if (createQuoteDetailDto?.markingServices || createQuoteDetailDto?.markingServices?.length > 0) {
      const markingServices: MarkingService[] = [];

      for (const markingServiceId of createQuoteDetailDto.markingServices) {
        const markingService: MarkingService = await this.markingServiceRepository.findOne({
          where: {
            id: markingServiceId,
          },
          relations: [
            'marking',
            'marking.company',
            'markingServiceProperty',
            'markingServiceProperty.markedServicePrices',
          ],
        });

        if (!markingService)
          throw new NotFoundException(`Marking service with id ${markingServiceId} not found`);

        if (!markingService.isActive)
          throw new BadRequestException(`Marking service with id ${markingServiceId} is currently inactive`);

        markingServices.push(markingService);
      }

      newQuoteDetail.markingServices = markingServices;
    };

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: newQuoteDetail.cartQuote.id,
      }
    });

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${newQuoteDetail.cartQuote.id} not found`);

    cartQuoteDb.totalPrice += newQuoteDetail.total || 0;
    cartQuoteDb.productsQuantity += newQuoteDetail.quantities || 0;



    //* ------------- CALCULOS ------------- *//
    const quantity: number = newQuoteDetail.quantities || 0;
    let totalPrice: number = newQuoteDetail.unitPrice || 0;
    let totalTransportPrice: number = 0;
    let totalCost: number = 0;
    let productVolume: number = 0;
    let totalVolume: number = 0;


    console.log(quantity)
    console.log(totalPrice)

    // DATOS A FUTURO PARA CALCULAR TRANSPORTES

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
    let markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();



    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
    const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
      .getMany();

    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX
    let tokenFedeex;
    try {
      tokenFedeex = await this.obtenerTokenFedex();
      console.log(tokenFedeex);
      // Ahora puedes hacer lo que necesites con el token, por ejemplo, hacer una solicitud utilizando el token.
    } catch (error) {
      // Maneja el error si ocurre alguno al obtener el token
      console.error('Error al usar el token de FedEx:', error);
    }



    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
    const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    console.log(packing)

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities) || 0;

    if (quantity <= packingUnities) { boxesQuantity = 1 || 0; } else { boxesQuantity = Math.ceil(quantity / packingUnities) || 0; }



    //* CALCULAR EL VOLUMEN DEL PAQUETE
    const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
    totalVolume = (packingVolume * boxesQuantity) || 0;
















    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];

    //* SE SOLICITA MUESTRA
    let ValorMuestraIndividual = 0;
    let TotalMuestra = 0;
    let TransporteMuestra = 0;
    let TotalGastoMuestra = 0;
    let CuatroPorMilMuestra = 0;
    let CostoTotalMuestra = 0
    let IvaMuestra = 0;
    let ValorTotalDeTransporteGeneral = 0;

    if (hasSample) {

      //* CALCULAR EL PRECIO DE LA MUESTRA

      newQuoteDetail.hasSample = true;
      const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;
      newQuoteDetail.sampleValue = 0;

      if (!productHasFreeSample) {
        const samplePrice: number = product?.samplePrice || 0;
        ValorMuestraIndividual = samplePrice;
        if (samplePrice <= 0) {
          const referencePrice: number = product?.referencePrice || 0;
          totalPrice += referencePrice;
          ValorMuestraIndividual = referencePrice;
        };
        console.log(ValorMuestraIndividual)



        // IVA A LA MUESTRA

        if (product.iva > 0 || product.iva != undefined) {
          IvaMuestra = (product.iva / 100) * ValorMuestraIndividual;
          totalPrice += IvaMuestra;
          // console.log(totalPrice)
        };

        if (product.iva == 0) {
          IvaMuestra = (19 / 100) * ValorMuestraIndividual;
          totalPrice += IvaMuestra;
          // console.log(totalPrice)
        }
        console.log(IvaMuestra)


        // TOTAL MUESTRA === VARIABLE GLOBAL
        TotalMuestra = ValorMuestraIndividual + IvaMuestra;
        console.log(TotalMuestra)


        // Transporte de la Muestra
        // if (newQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
        //   const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
        //     ? markingTransportPrices.sort((a, b) => {
        //       const diffA = Math.abs(a.volume - totalVolume);
        //       const diffB = Math.abs(b.volume - totalVolume);
        //       return diffA - diffB;
        //     })[0]
        //     : undefined;

        //   const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

        //   totalPrice += clientTransportPrice;

        //   // newQuoteDetail.transportTotalPrice = 0;
        //   // newQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
        //   // newQuoteDetail.sampleValue += clientTransportPrice || 0;

        //   TransporteMuestra = clientTransportPrice;

        // } else {
          //TODO: FEDEX
          
          // newQuoteDetail.transportTotalPrice += TransporteMuestra;


          // Calcular precio transporte al cliente
          let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);

          if (typeof dataPrecio === 'number') {
            // COSTO TRANSPORTE DE ENTREGA
            TransporteMuestra = dataPrecio;
          } else {
            console.error('Error: dataPrecio no es de tipo numérico.');
          }
          console.log(TransporteMuestra);


        // }

        console.log(TransporteMuestra);

        // SUMA CONTONIA DEL TRANSPORTE TOTAL
        // ValorTotalDeTransporteGeneral += TransporteMuestra,
        newQuoteDetail.sampleTransportValue = TransporteMuestra;

        // TOTAL GASTOS MUESTRA === VARIABLE GLOBAL
        TotalGastoMuestra = TotalMuestra + TransporteMuestra;


        // CUATRO POR MIL MUESTRA 
        CuatroPorMilMuestra = TotalGastoMuestra * 0.004 || 0;
        newQuoteDetail.transportServices4x1000 = CuatroPorMilMuestra;
        console.log(CuatroPorMilMuestra)


        // COSTO TOTAL MUESTRA === VARIABLE GLOBAL
        CostoTotalMuestra = TotalGastoMuestra + CuatroPorMilMuestra;
        console.log(CostoTotalMuestra)

        // totalPrice += samplePrice;
        newQuoteDetail.sampleValue = CostoTotalMuestra;
        // newQuoteDetail.sampleValue = referencePrice;

      };
    } else {
      newQuoteDetail.hasSample = false;
    };











    // CALCULOS DEL TRANSPORTE

    //* CALCULAR EL VOLUMEN DEL PRODUCTO
    productVolume = (product?.height * product?.weight * product?.large) || 0;

    //* DATOS DEL CLIENTE
    const cartQuoteClient: Client = cartQuote?.client;
    const clientUser: User = cartQuote?.client?.user;
    let clientType: string = '';

    //* PRECIO ESCOGIDO EN EL DETALLE DEL PRODUCTO ANTES DEL CARRITO
    const burnQuantity: number = newQuoteDetail?.unitPrice || 0;
    totalCost += burnQuantity;
    // newQuoteDetail.transportTotalPrice = 0;



    //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
    const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
    const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };


    // Calcular precio transporte al cliente
    let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);
    console.log((typeof dataPrecio))

    let CuatroPorMilTransporte = 0;
    let CostoTransporteDeEntrega;

    if (typeof dataPrecio === 'number') {

      // COSTO TRANSPORTE DE ENTREGA
      CostoTransporteDeEntrega = dataPrecio;

      CuatroPorMilTransporte = dataPrecio * 0.004 || 0;
    } else {
      console.error('Error: dataPrecio no es de tipo numérico.');
    }
    console.log(CuatroPorMilTransporte);


    // COSTO TOTAL TRANSPORTE DE ENTREGA
    const CostoTotalTransporteDeEntrega = CostoTransporteDeEntrega + CuatroPorMilTransporte;
    console.log(CostoTotalTransporteDeEntrega)


    // SUMA CONTONIA DEL TRANSPORTE TOTAL
    // ValorTotalDeTransporteGeneral += (CostoTotalTransporteDeEntrega)









    // INICIO CALCULO DE SERVICIO DE MARCACIÓN
    let ValorTotalMarcacion = 0;
    let valorTransporteMarcacion = 0;
    let valorTransporteMarcacionx = 0;


    const markingServices: MarkingService[] = newQuoteDetail?.markingServices || [];
    console.log(markingServices)
    //* Buscamos los datos de la referencia
    const quoteDetailRefProduct: RefProduct = product.refProduct;
    console.log(quoteDetailRefProduct);
    let marking: Marking;
    let datoTransporte;

    // Preguntamos si es personalizable ?
    if (quoteDetailRefProduct?.personalizableMarking == 1) {
      if (markingServices || markingServices.length > 0) {
        console.log(markingServices)
        for (const markingService of markingServices) {
          let markingServicePropertyPrice: number = 0;

          const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;
          console.log(markingServiceProperty)
          for (const markedServicePrice of markingServiceProperty.markedServicePrices) {

            // Codigo postal del proveedor de marcación
            console.log(markingService?.marking?.company?.postalCode)

            if (quantity >= markedServicePrice.minRange && quantity <= markedServicePrice.maxRange) {

              console.log(markedServicePrice.unitPrice)

              let totalMarking: number = (quantity * markedServicePrice.unitPrice);

              // marking = markingServiceProperty?.externalSubTechnique?.marking;
              marking = markingService?.marking;
              console.log(totalMarking)

              console.log()
              //* SI EL SERVICIO DE MARCADO TIENE IVA
              if (marking.iva > 0) {
                //* CALCULAR EL IVA
                const iva: number = (marking.iva / 100) * totalMarking || 0;
                totalMarking += iva;
                totalCost += iva;
                newQuoteDetail.markingPriceWithIva = iva;
                //* CALCULAR EL 4X1000
                let value4x1000: number = totalMarking * 0.004 || 0;
                totalMarking += value4x1000;
                totalCost += value4x1000;
                newQuoteDetail.markingPriceWith4x1000 = value4x1000;
              };

              //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
              const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
              totalMarking += marginForDialingServices;
              console.log(totalMarking)
              

              // Calcular precio transporte al cliente
              let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);

              let CuatroPorMilTransporte = 0;
              let TransportPricesMarkingFedex;

              if (typeof dataPrecio === 'number') {

                // COSTO TRANSPORTE DE ENTREGA
                TransportPricesMarkingFedex = dataPrecio;
                CuatroPorMilTransporte = dataPrecio * 0.004 || 0;
              } else {
                console.error('Error: dataPrecio no es de tipo numérico.');
              }

              // Aquí puedes usar TransportPricesMarkingFedex para cualquier lógica adicional

              markingService.markingTransportPrice = TransportPricesMarkingFedex;
              totalMarking += TransportPricesMarkingFedex;
              totalCost += TransportPricesMarkingFedex;

              valorTransporteMarcacion += TransportPricesMarkingFedex;

              //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
              const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * TransportPricesMarkingFedex || 0;
              totalMarking += supplierFinancingPercentage;

              markingService.markingTransportPrice = (TransportPricesMarkingFedex + supplierFinancingPercentage) || 0;
              markingService.calculatedMarkingPrice = totalMarking;

              ValorTotalMarcacion += totalMarking;

              valorTransporteMarcacionx = (valorTransporteMarcacion)

              newQuoteDetail.markingWithProductSupplierTransport = TransportPricesMarkingFedex;

              // await this.markingServiceRepository.save(markingService); // 
              // await this.markingServicePropertyRepository.save(markingService);
            };
          };
        };
      };
    };


      // valorTransporteMarcacionx = (data)
      console.log(ValorTotalMarcacion)



      // COTO TRANSPORTE MARCACIÓN ==== VARIABLE GLOBAL 
      console.log(valorTransporteMarcacionx)


      //SUBTOTAL COSTO MARCACIÓN
      let SubTotalCostoMarcacion = ValorTotalMarcacion || 0;
      SubTotalCostoMarcacion = Math.round(SubTotalCostoMarcacion)
      console.log(SubTotalCostoMarcacion)

      newQuoteDetail.markingTotalPrice = SubTotalCostoMarcacion;


      //* CALCULAR EL IVA
      let IvaMarcacion: number = (19 / 100) * SubTotalCostoMarcacion;
      IvaMarcacion = Math.round(IvaMarcacion)
      console.log(IvaMarcacion)


      // TOTAL COSTO MARCACIÓN
    let TotalCostoMarcacion = SubTotalCostoMarcacion + IvaMarcacion + valorTransporteMarcacionx;
      TotalCostoMarcacion = Math.round(TotalCostoMarcacion)
      console.log(TotalCostoMarcacion)


      //* CALCULAR EL 4X1000
      let CuatroPorMilMarcacion: number = TotalCostoMarcacion * 0.004 || 0;
      CuatroPorMilMarcacion = Math.round(CuatroPorMilMarcacion)
      console.log(CuatroPorMilMarcacion)

      //COSTO TOTAL MARCACIÓN
      let CostoTotalMarcacion = TotalCostoMarcacion + CuatroPorMilMarcacion;
      CostoTotalMarcacion = Math.round(CostoTotalMarcacion)
      console.log(CostoTotalMarcacion)



      // SUBTOTAL
      TransporteMuestra = Math.round(TransporteMuestra); 
      CuatroPorMilMuestra = Math.round(CuatroPorMilMuestra); 

      let SubTotal = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra + CostoTotalTransporteDeEntrega + SubTotalCostoMarcacion + CuatroPorMilMarcacion;
      SubTotal = Math.round(SubTotal)
      console.log(SubTotal)

      // IVA SUBTOTAL
      let IvaSubtotal = IvaMuestra + IvaMarcacion;
      IvaSubtotal = Math.round(IvaSubtotal)
      console.log(IvaSubtotal)


      // TOTAL GASTOS DE ADICIONALES
      let TotalGastosAdicionales = CostoTotalMuestra + CostoTotalTransporteDeEntrega + CostoTotalMarcacion;
      TotalGastosAdicionales = Math.round(TotalGastosAdicionales)
      console.log(TotalGastosAdicionales)









      // SECCION INGRESOS POR ADICIONALES		=========================================================> 

      // MARGEN DE LA CATEGORIA
      const mainCategoryTag: CategoryTag = await this.categoryTagRepository.findOne({
        where: {
          id: product?.refProduct?.tagCategory,
        },
      });

      //* MARGEN DE GANANCIA DEL PROVEEDOR
      const profitMarginSupplier: number = product?.refProduct?.supplier?.profitMargin || 0;


      //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
      let MargenCliente = 0;
      let MargenPorFinanciacion = 0;
      if (clientType == 'cliente corporativo secundario') {
        //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
        const mainClient: Client = await this.clientRepository
          .createQueryBuilder('client')
          .leftJoinAndSelect('client.user', 'clientUser')
          .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
          .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
          .leftJoinAndSelect('clientUserCompany.users', 'companyUsers')
          .andWhere('companyUsers.isCoorporative =:isCoorporative', { isCoorporative: 1 })
          .andWhere('companyUsers.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
          .getOne();

        totalPrice += mainClient?.margin;
        MargenCliente = mainClient?.margin;
        console.log(MargenCliente)
      } else {
        MargenCliente = 10;
        console.log(MargenCliente) 

      };

      totalPrice += cartQuote?.client?.margin || 0;


      // DEFINIR EL TIPO DE CLIENTE QUE ES EL CLIENTE
      if (clientUser) {
        if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
          clientType = 'cliente corporativo secundario';
        else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
          clientType = 'cliente corporativo principal';
      };


      // nuevo Yeison
      let financeCostProfist: any = await this.systemFinancingCostProfit.find();
      console.log(financeCostProfist)



      // DIAS DE PAGO DEL CLIENTE CORPOATIV
      let DiasPagoClienteCorporativo = 0;
      let DiasPagoClienteCorporativoRentabilidad = 0;


      //* MARGEN POR FINANCIACIÓN 
      // const MargenPorFinanciacion: number = 0;

      let paymentDays: any[] = [];
      for (const paymentDate of financeCostProfist) {
        let data = {
          day: paymentDate.days,
          percentage: paymentDate.financingPercentage / 100,
          rentability: 0
        }

        paymentDays.push(data)
      }


      console.log(paymentDays)



      // Días de pago de Cliente NO Corporativo
      const day60 = paymentDays.find(item => item.day === 1);
      // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
      DiasPagoClienteCorporativo = day60 ? day60.day : 0;
      DiasPagoClienteCorporativoRentabilidad = day60 ? day60.financingPercentage : 0; //yeison


      let marginProfit: number = 0;

      marginProfit = systemConfig.noCorporativeClientsMargin;


      // Días de pago de Cliente NO Corporativo
      console.log(day60)
      // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0


      //* SI EL CLIENTE ES SECUNDARIO
      if (clientType == 'cliente corporativo secundario') {
        //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
        const mainClient: Client = await this.clientRepository
          .createQueryBuilder('client')
          .leftJoinAndSelect('client.user', 'clientUser')
          .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
          .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
          .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
          .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
          .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
          .getOne();

        marginProfit = mainClient.margin || 0;
        const paymentTerms: number = mainClient.paymentTerms || 0;

        //Capturamos los dias fr pago del cliente corporativo.
        DiasPagoClienteCorporativo = paymentTerms || 0;

        let percentageDiscount: number = 0;

        paymentDays.forEach(paymentDay => {
          if (paymentDay.day == paymentTerms) {
            percentageDiscount = paymentDay.percentage;
          };
        });

        // Precio original * (1 - Descuento individual) * (1 - Descuento general)
        MargenPorFinanciacion = percentageDiscount;

        let value: number = totalPrice * (1 - percentageDiscount);
        totalPrice = Math.round(value);
      };

      //* SI EL CLIENTE ES PRINCIPAL
      if (clientType == 'cliente corporativo principal') {
        const margin: number = cartQuoteClient.margin || 0;
        marginProfit = margin;
        const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

        //Capturamos los dias fr pago del cliente corporativo.
        DiasPagoClienteCorporativo = paymentTerms || 0;

        let percentageDiscount: number = 0;

        paymentDays.forEach(paymentDay => {
          if (paymentDay.day == paymentTerms) {
            percentageDiscount = paymentDay.percentage;
          };
        });

        MargenPorFinanciacion = percentageDiscount ;

        let value: number = totalPrice * (1 - percentageDiscount);
        totalPrice = Math.round(value);
      };



      console.log(DiasPagoClienteCorporativo)
      console.log(marginProfit)
      MargenCliente = marginProfit;

      let SumaInicial: number = 0;

      console.log(ValorMuestraIndividual)
      console.log(TransporteMuestra)
      console.log(CuatroPorMilMuestra)

      console.log(+mainCategoryTag.categoryMargin)
      console.log(profitMarginSupplier)

      console.log(MargenCliente)
      console.log(MargenPorFinanciacion)

      

      SumaInicial = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra;
      console.log(SumaInicial)


      let sumaSecundaria: number = 0;
      sumaSecundaria = (1 + (+mainCategoryTag.categoryMargin + profitMarginSupplier) / 100)
      console.log(sumaSecundaria)


      let sumaTerciaria: number = 0;
      sumaTerciaria = (1 + (MargenCliente + (MargenPorFinanciacion * 100)) / 100)
      console.log(sumaTerciaria)


      // SUBTOTAL ==== VARIABLE GLOBAL
      let SubtotalIngresosAdicionales = (SumaInicial * sumaSecundaria) * sumaTerciaria;

      SubtotalIngresosAdicionales = Math.round(SubtotalIngresosAdicionales);
      console.log(SubtotalIngresosAdicionales)



      // MARCA Y/O FEE DEL CLIENTE DEL CARRITO == VARIABLE GLOBAL 
      let feeMarcaCliente = 0;
      console.log(clientType)

      if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
        const brandId = cartQuote.brandId;
        console.log(brandId)


        if (brandId != '') {
          const cartQuoteBrand: Brand = await this.brandRepository.findOne({
            where: {
              id: brandId,
            },
          });

          if (!cartQuoteBrand)
            throw new NotFoundException(`Brand with id ${brandId} not found`);
          console.log(cartQuoteBrand)

          if (cartQuoteBrand) {
            const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;
            feeMarcaCliente = +cartQuoteBrand.fee;
            totalPrice += fee;
            totalCost += fee;
            newQuoteDetail.aditionalClientFee = fee;
            cartQuote.fee = fee;
          };
        };
      };

      console.log(feeMarcaCliente)








      // =========================== CALCULO FEE MUESTRA


      // ======== CALCULO FEE ITERATIVO MUESTRA
      let calculoMagenes = (1 + (marginProfit + MargenPorFinanciacion) / 100);
      let feeDecimal = 1 + (feeMarcaCliente / 100);

      let valorBase = SubtotalIngresosAdicionales;

      let F29 = SubtotalIngresosAdicionales;
      let F6 = marginProfit / 100;
      let F7 = MargenPorFinanciacion;
      let F8 = feeMarcaCliente / 100;


      let primerCalculo = F29 * (1 + F6 + F7) * F8;
      let segundoCalculo = primerCalculo * F8;
      let tercerCalculo = segundoCalculo * F8;
      let cuartoCalculo = tercerCalculo * F8;

      let resultado = primerCalculo + segundoCalculo + tercerCalculo + cuartoCalculo;
      let FeeMuestraTotalCalculado = resultado;
      FeeMuestraTotalCalculado = Math.round(FeeMuestraTotalCalculado);
      console.log(FeeMuestraTotalCalculado)
      // ======== FIN CALCULO FEE ITERATIVO MUESTRA


      // SUBTOTAL
      let SubTotalFeeMuestra = SubtotalIngresosAdicionales + FeeMuestraTotalCalculado;
      SubTotalFeeMuestra = Math.round(SubTotalFeeMuestra);
      console.log(SubTotalFeeMuestra)


      //* CALCULAR EL IVA yeison
      let IvaSubTotal: number = (19 / 100) * SubTotalFeeMuestra;
      IvaSubTotal = Math.round(IvaSubTotal);
      console.log(IvaSubTotal)


      // TOTAL PRECIO MUESTRA CON IVA
      let TotalPrecioMuestraConIva = SubTotalFeeMuestra + IvaSubTotal;
      TotalPrecioMuestraConIva = Math.round(TotalPrecioMuestraConIva);
      console.log(TotalPrecioMuestraConIva)















      // =========================== CALCULO FEE TRANSPORTE

      // MARGEN DEL TRANSPORTE (PARAMETRIZACION)
      const marginForTransportServices: number = systemConfig.marginForTransportServices || 0;


      console.log(marginForTransportServices)
      // Convertimos los porcentajes a valores decimales
      let maerginTrans = (marginForTransportServices) / 100;
      let marginCli = (marginProfit) / 100;
      let marginFian = (MargenPorFinanciacion);


      console.log(marginCli)
      console.log(marginFian)
      console.log(maerginTrans)
      console.log(CostoTotalTransporteDeEntrega)
      console.log(marginFian)


      let sumaF6F7 = marginCli + marginFian;
      let SubTotalTransporte = CostoTotalTransporteDeEntrega * (1 + (maerginTrans + sumaF6F7));

      // SUBTOTAL TRANSPORTE
      SubTotalTransporte = (Math.ceil(SubTotalTransporte));
      console.log(SubTotalTransporte)







      // ======== CALCULO FEE ITERATIVO TRANSPORTE 
      let F36 = SubTotalTransporte;
      F6 = marginProfit / 100;
      F7 = MargenPorFinanciacion;
      F8 = feeMarcaCliente / 100;

      console.log(F8)

      let primerCalculoTransporte = F36 * (1 + F6 + F7) * F8;
      let segundoCalculoTransporte = primerCalculoTransporte * F8;
      let tercerCalculoTransporte = segundoCalculoTransporte * F8;
      let cuartoCalculoTransporte = tercerCalculoTransporte * F8;

      let resultadoTransporte = primerCalculoTransporte + segundoCalculoTransporte + tercerCalculoTransporte + cuartoCalculoTransporte;
      let FeeTransporteTotalCalculado = resultadoTransporte;
      FeeTransporteTotalCalculado = Math.round(FeeTransporteTotalCalculado);
      console.log(FeeTransporteTotalCalculado)
      // ======== FIN CALCULO FEE ITERATIVO TRANSPORTE



      
      // SUBTOTAL PRECIO TRANSPORTE DE ENTREGA
      const TotalPrecioTransporteDeEntrega = SubTotalTransporte + FeeTransporteTotalCalculado;
      console.log(TotalPrecioTransporteDeEntrega)

      newQuoteDetail.transportTotalPrice = TotalPrecioTransporteDeEntrega;

























      

      // =========================== CALCULO FEE MARCACION

      // MARGEN SERVICIO DE MARCACIÓN (PARAMETRIZACIÓN)
      const marginForDialingServices: number = systemConfig.marginForDialingServices || 0;

      console.log(SubTotalCostoMarcacion)
      console.log(CuatroPorMilMarcacion)
      console.log(marginForDialingServices)
      console.log(marginCli)
      console.log(marginFian)
      console.log(sumaF6F7)


      let marginFDS = marginForDialingServices / 100;
      // Convertir porcentajes a valores decimales
      let F40 = (CostoTotalTransporteDeEntrega);

      let alculoSubTotalInicial = valorTransporteMarcacionx + SubTotalCostoMarcacion + CuatroPorMilMarcacion;
      console.log(valorTransporteMarcacionx)
      console.log(SubTotalCostoMarcacion)
      console.log(CuatroPorMilMarcacion)

      console.log(marginFDS)
      console.log(sumaF6F7)
      console.log(alculoSubTotalInicial)
      const marginForDialingServicesConversion = marginForDialingServices / 100;
      console.log(marginForDialingServicesConversion)

      // Evaluar la fórmula
      let SubTotalSinFeeMarcacion = (alculoSubTotalInicial) * (1 + (marginForDialingServicesConversion + sumaF6F7));
      console.log(SubTotalSinFeeMarcacion)





      // ======== CALCULO FEE ITERATIVO MARCACION
      let F41 = SubTotalSinFeeMarcacion;
      F6 = marginProfit / 100;
      F7 = MargenPorFinanciacion;
      F8 = feeMarcaCliente / 100;

      let primerCalculoMarcacion = F41 * (1 + F6 + F7) * F8;
      let segundoCalculoMarcacion = primerCalculoMarcacion * F8;
      let tercerCalculoMarcacion = segundoCalculoMarcacion * F8;
      let cuartoCalculoMarcacion = tercerCalculoMarcacion * F8;

      let resultadoMarcacion = primerCalculoMarcacion + segundoCalculoMarcacion + tercerCalculoMarcacion + cuartoCalculoMarcacion;
      let FeeMarcacionTotalCalculado = resultadoMarcacion;
      FeeMarcacionTotalCalculado = Math.round(FeeMarcacionTotalCalculado);
      console.log(FeeMarcacionTotalCalculado)
      // ======== FIN CALCULO FEE ITERATIVO MARCACION




      // TOTAL PRECIO MARCACION DE ENTREGA
      let SubTotalPrecioMarcacionDeEntrega = SubTotalSinFeeMarcacion + FeeMarcacionTotalCalculado;
      console.log(SubTotalPrecioMarcacionDeEntrega);

      //* IVA FEE MARCACION
      const IvaFeeMarcacion: number = (19 / 100) * SubTotalPrecioMarcacionDeEntrega || 0;

      // // TOTAL PRECIO MARCACION CON IVA
      let TotalPrecioMarcacionDeEntrega = SubTotalPrecioMarcacionDeEntrega + IvaFeeMarcacion;
      console.log(TotalPrecioMarcacionDeEntrega);

    
    
    

    // SUB TOTAL TODOS LOS FEE
    
    console.log(SubTotalFeeMuestra);
    console.log(TotalPrecioTransporteDeEntrega);
    console.log(SubTotalPrecioMarcacionDeEntrega);

      let SubTotalFees = SubTotalFeeMuestra + TotalPrecioTransporteDeEntrega + SubTotalPrecioMarcacionDeEntrega;
      SubTotalFees = Math.round(SubTotalFees);
      console.log(SubTotalFees);


      // IVAS TODOS LOS FEE
      let IvasTotalFees = (19 / 100) * SubTotalFees || 0;
      IvasTotalFees = Math.round(IvasTotalFees);
      console.log(IvasTotalFees);


      // TOTAL INGRESOS DE ADICIONALES
      let TotalIngresosAdicionales = SubTotalFees + IvasTotalFees;
      TotalIngresosAdicionales = Math.round(TotalIngresosAdicionales);
      console.log(TotalIngresosAdicionales);























      // TERCERA PARTE DEL CALCULO RENTABILIDAD FINAL ================================================================>


      // TOTAL INGRESOS ANTES DE IVA
      const TotalIngresosAntesDeIva = newQuoteDetail?.unitPrice + SubTotalFees;
      console.log(TotalIngresosAntesDeIva)


      console.log(DiasPagoClienteCorporativo)
      // Dias de pago del cliente 

      const C23 = createQuoteDetailDto.totalCostoProduccion; // Ttoal costo producción
      // const C16 = marginProfit / 100; // 20% Financiacion cliente
      const C16 = systemConfig.supplierFinancingPercentage / 100; // 20% Financiacion cliente
      const F62 = DiasPagoClienteCorporativo; // Dias de pago
      const C49 = TotalGastosAdicionales; // Gastos adicionales

      let resultadoCostoFnanciarion = (C23 * (C16 / 30) * (F62 + 15)) + (C49 * (C16 / 30) * (F62 + 15));
      resultadoCostoFnanciarion = Math.round(resultadoCostoFnanciarion);
      console.log(resultadoCostoFnanciarion)

      // hasta aqui todo bien




      // FEE REGISTRADO EN EL CARRITO == FEE SELECCIONADO AL INICIAR SESION
      const Fee = feeMarcaCliente || 0;
      const ResultFee = TotalIngresosAntesDeIva * Fee / 100;
      console.log(Fee)

      // RESULTADO PORCEENTAJE FEE 
      let porcentajeFee = (Fee / 100) * TotalIngresosAntesDeIva;
      porcentajeFee = Math.round(porcentajeFee);
      console.log(porcentajeFee)

      // TOTAL GASTOS ANTES DE IVA === VARIABEL GOBAL 
      const TotalGastoAntesDeIva = SubTotal + createQuoteDetailDto.totalCostoProduccionSinIva + resultadoCostoFnanciarion + ResultFee;
      console.log(TotalGastoAntesDeIva)


      // UTILIDAD DE VENTAS == VARIABLE GLOBAL 
      const UtilidadDeVentas = TotalIngresosAntesDeIva - TotalGastoAntesDeIva;
      console.log(UtilidadDeVentas)


      // % UTILIDAD DE VENTAS ROI == VARIABLE GLOBAL 
      const UtilidadDeVentasROI = (UtilidadDeVentas / TotalGastoAntesDeIva) * 100;
      const ProcentajeUtilidadDeVentasROI = parseFloat(UtilidadDeVentasROI.toFixed(2));

      console.log(ProcentajeUtilidadDeVentasROI)

      // RETENCIONES === VARIABLE GLOBAL 
      let ValueRetenciones = systemConfig.withholdingAtSource / 100;
      console.log(ValueRetenciones)
      console.log(TotalIngresosAntesDeIva)
      let Retenciones = (TotalIngresosAntesDeIva * ValueRetenciones);
      Retenciones = Math.round(Retenciones);
      console.log(Retenciones)

      newQuoteDetail.withholdingAtSourceValue = Retenciones;






      // UTILIDAD COMERCIALES

      //UTILIDAD - LIQUIDEZ FINAL
      console.log(TotalIngresosAntesDeIva)
      console.log(TotalGastoAntesDeIva)
      console.log(Retenciones)
      const UtilidadLiquidezFinal = TotalIngresosAntesDeIva - TotalGastoAntesDeIva - Retenciones
      console.log(UtilidadLiquidezFinal);


      // % UTILIDAD ROI - LIQUIDEZ FINAL
      let PorcentajeUtilidadRoi_LiquidezFinal = (UtilidadLiquidezFinal / TotalGastoAntesDeIva) * 100;
      PorcentajeUtilidadRoi_LiquidezFinal = Math.round(PorcentajeUtilidadRoi_LiquidezFinal * 100) / 100;
      console.log(PorcentajeUtilidadRoi_LiquidezFinal);



      // RATIO UTILIDAD MENSUAL
      let RatiosUtilidadMensual = (PorcentajeUtilidadRoi_LiquidezFinal / DiasPagoClienteCorporativo) * 30;
      // RatiosUtilidadMensual = Math.round(RatiosUtilidadMensual * 100 ) / 100;
      console.log(RatiosUtilidadMensual);




      // RENTABILIDAD MINIMA ESPERADA

      let F622 = DiasPagoClienteCorporativo;
      let C566 = 0.04; // 4.0% en formato decimal
      let C54 = 0.08; // 8.0% en formato decimal

      // Comprueba si F622 es mayor que 30
      let RentabiliadMinima =
        F622 > 30 ? (C566 / 30) * F622 : (C54 / 30) * F622;

      // Formatea el resultado como porcentaje
      let RentabiliadMinimaEsperada = parseFloat((RentabiliadMinima * 100).toFixed(2));
      console.log(RentabiliadMinimaEsperada);
      newQuoteDetail.profitability = RentabiliadMinimaEsperada;

      console.log()

      // DESCUENTO SUGERIDO AL COMERCIAL
      const F72 = UtilidadLiquidezFinal;
      const C60 = TotalGastoAntesDeIva;
      const F69 = Retenciones;
      const F76 = RentabiliadMinimaEsperada / 100; // Convertir el porcentaje a decimal (4%)
      const F60 = TotalIngresosAntesDeIva;

      const resultadoDescuentoSgerido = ((F72 - ((C60 + F69) * F76)) / F60) * 100; // Calculamos el resultado en porcentaje

      //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
      newQuoteDetail.maximumDiscount = resultadoDescuentoSgerido;
      console.log(resultadoDescuentoSgerido)


      // VALORES FINALES DE VENTA ========================

      // SUBTOTAL CON DESCUENTO
      const SubTotalFinalesDeIva = TotalIngresosAntesDeIva;
      console.log(SubTotalFinalesDeIva);

      newQuoteDetail.subTotal = SubTotalFinalesDeIva;
      newQuoteDetail.totalAdditionalDiscount = 0;
      newQuoteDetail.subTotalWithDiscount = newQuoteDetail.subTotal || 0;
      newQuoteDetail.totalCost = SubTotalFinalesDeIva; // Subtotal con descuento
      newQuoteDetail.totalValueWithoutIva = newQuoteDetail.subTotal || 0;


      let IvaSnTotalFinal: number = (19 / 100) * SubTotalFinalesDeIva;
      IvaSnTotalFinal = Math.round(IvaSnTotalFinal);
      console.log(IvaSnTotalFinal);


      newQuoteDetail.iva = IvaSnTotalFinal;


      let TotalVenta: number = SubTotalFinalesDeIva + IvaSnTotalFinal;
      TotalVenta = Math.round(TotalVenta);
      console.log(TotalVenta);
      newQuoteDetail.totalValue = TotalVenta;

    console.log()



      // UTILIDADES FINALES


      // UTILIDAD FINAL CON DESCUENTO
      let UtilidadFinalConDescuento = SubTotalFinalesDeIva - TotalGastoAntesDeIva - Retenciones
      UtilidadFinalConDescuento = Math.round(UtilidadFinalConDescuento);

      console.log(UtilidadFinalConDescuento)

      newQuoteDetail.businessUtility = UtilidadFinalConDescuento;

      // % UTILIDAD FINAL CON DESCUENTO
      let PorcentajeUtilidadFinalConDescuento = (UtilidadFinalConDescuento / (TotalGastoAntesDeIva + Retenciones)) * 100;

      console.log(PorcentajeUtilidadFinalConDescuento)






      // Datos a guardar
      newQuoteDetail.totalGasto = TotalGastoAntesDeIva;
      newQuoteDetail.totalIngresos = TotalIngresosAntesDeIva;
      newQuoteDetail.rentabilidadMininaEsperada = RentabiliadMinimaEsperada;
      newQuoteDetail.descuentoSugerido = resultadoDescuentoSgerido;
      newQuoteDetail.UtilidadFinal = UtilidadFinalConDescuento;
      newQuoteDetail.porcentajeUtilidadFinal = PorcentajeUtilidadFinalConDescuento;

      cartQuoteDb.ivaTotal += IvaSnTotalFinal;
      cartQuoteDb.subTotal += SubTotalFinalesDeIva;


      newQuoteDetail.discountPercentage = 0; // reutilizar

      newQuoteDetail.discount = product.promoDisccount;

      //* CALCULAR SUBTOTAL CON DESCUENTO

      //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
      const businessMarginProfit: number = (totalPrice - newQuoteDetail.totalValueWithoutIva);
      newQuoteDetail.businessMarginProfit = businessMarginProfit;
      cartQuoteDb.totalPrice += TotalVenta;

      // //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
      console.log(newQuoteDetail.transportTotalPrice)

      // await this.cartQuoteRepository.save(cartQuoteDb);
      // await this.quoteDetailRepository.save(newQuoteDetail);

      return {
        newQuoteDetail,
        cartQuoteDb
      };



  };


  // 












  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.quoteDetailRepository.find({
      take: limit,
      skip: offset,
      relations: [
        'markingServices',
      ],
    });
  }

  async findOne(id: string) {
    const quoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'markingServices',
      ],
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    return {
      quoteDetail
    };
  }






















  async update(id: string, updateQuoteDetailDto: UpdateQuoteDetailDto, save: number) {
    let saveData: number = 0;

    if (save) {
      saveData = save;
    };

    const hasSample: boolean = updateQuoteDetailDto.hasSample;

    console.log(hasSample)

    const quoteDetail: QuoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'cartQuote',
        'cartQuote.client',
        'cartQuote.client.user',
        'cartQuote.client.user.company',
        'cartQuote.client.user.brands',
        'product.packings',
        'product.refProduct',
        'product.refProduct.images',
        'product.refProduct.packings',
        'product.refProduct.supplier',
        'product.refProduct.supplier.disccounts',
        'product.refProduct.supplier.disccounts.disccounts',
        'markingServices',
        'markingServices.marking',
        'markingServices.markingServiceProperty',
        'markingServices.markingServiceProperty.markedServicePrices',
      ],
    });


    console.log(quoteDetail)

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, quoteDetail);

    if (updateQuoteDetailDto.quantities) {
      updatedQuoteDetail.quantities = updateQuoteDetailDto.quantities;
    };

    if (updateQuoteDetailDto.discount) {
      updatedQuoteDetail.discount = updateQuoteDetailDto.discount;
      updatedQuoteDetail.discountPercentage = updateQuoteDetailDto.discount;
    };

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: quoteDetail.cartQuote.id,
      }
    });

    const product: Product = quoteDetail.product;
    const cartQuote: CartQuote = quoteDetail.cartQuote;

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${quoteDetail.cartQuote.id} not found`);

    cartQuoteDb.productsQuantity += quoteDetail.quantities || 0;

    //* ------------- CALCULOS ------------- *//
    const quantity: number = updatedQuoteDetail.quantities || 0;
    let totalPrice: number = updatedQuoteDetail.unitPrice * quantity || 0;
    let totalTransportPrice: number = 0;
    let totalCost: number = 0;
    let productVolume: number = 0;
    let totalVolume: number = 0;

    cartQuoteDb.totalPrice -= quoteDetail.totalValue;

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
    const markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
    const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
      .getMany();

    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX

    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];

    //* -------------------------- INICIO DE CALCULOS -------------------------- *//
    //* CALCULAR EL VOLUMEN DEL PRODUCTO
    productVolume = (product?.height * product?.weight * product?.large) || 0;

    //* DATOS DEL CLIENTE
    const cartQuoteClient: Client = cartQuote?.client;
    const clientUser: User = cartQuote?.client?.user;
    let clientType: string = '';

    //* CANTIDAD QUEMADA EN QUOTE DETAIL
    const burnQuantity: number = updatedQuoteDetail?.unitPrice || 0;
    totalCost += burnQuantity;
    updatedQuoteDetail.transportTotalPrice = 0;









    //* SE SOLICITA MUESTRA
    if (hasSample) {
      //* CALCULAR EL PRECIO DE LA MUESTRA
      // let samplePrice: number = await this.calculateSamplePrice(updatedQuoteDetail, systemConfig, quantity) || 0;
      // updatedQuoteDetail.sampleValue = samplePrice;
      // totalPrice += samplePrice;

      // totalCost += samplePrice;

      updatedQuoteDetail.hasSample = true;

      const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;

      updatedQuoteDetail.sampleValue = 0;

      if (!productHasFreeSample) {
        const samplePrice: number = product?.samplePrice || 0;

        if (samplePrice <= 0) {
          const referencePrice: number = product?.referencePrice || 0;
          totalPrice += referencePrice;
          updatedQuoteDetail.sampleValue = referencePrice;
        };

        totalPrice += samplePrice;
        updatedQuoteDetail.sampleValue = samplePrice;

        if (updatedQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
          const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
            ? markingTransportPrices.sort((a, b) => {
              const diffA = Math.abs(a.volume - totalVolume);
              const diffB = Math.abs(b.volume - totalVolume);
              return diffA - diffB;
            })[0]
            : undefined;

          const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

          updatedQuoteDetail.sampleTransportValue += clientTransportPrice;
          totalPrice += clientTransportPrice;
          // updatedQuoteDetail.transportTotalPrice = 0;
          // updatedQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
          // updatedQuoteDetail.sampleValue += clientTransportPrice || 0;
        } else {
          //TODO: FEDEX
          updatedQuoteDetail.transportTotalPrice += 20000;
        }
      };
    } else {
      updatedQuoteDetail.hasSample = false;
    };



















    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
    const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities) || 0;

    boxesQuantity = Math.round(boxesQuantity) + 1 || 0;

    //* CALCULAR EL VOLUMEN DEL PAQUETE
    const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
    totalVolume = (packingVolume * boxesQuantity) || 0;

    //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
    const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
    const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* COTIZAR SERVICIO DE MARCACIÓN
    const quoteDetailRefProduct: RefProduct = product.refProduct;

    const markingServices: MarkingService[] = updatedQuoteDetail?.markingServices || [];

    //* SI ES PERSONALIZABLE EL PRODUCTO

    if (quoteDetailRefProduct?.personalizableMarking == 1) {
      if (markingServices || markingServices.length > 0) {
        for (const markingService of markingServices) {
          let markingServicePropertyPrice: number = 0;

          const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;

          for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
            //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
            if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange <= quantity) {
              let totalMarking: number = (quantity * markedServicePrice.unitPrice);
              updatedQuoteDetail.markingTotalPrice = totalMarking;

              const marking: Marking = markingServiceProperty.externalSubTechnique.marking;

              //* SI EL SERVICIO DE MARCADO TIENE IVA
              if (marking.iva > 0) {
                //* CALCULAR EL IVA
                const iva: number = (marking.iva / 100) * totalMarking || 0;
                totalMarking += iva;
                totalCost += iva;
                updatedQuoteDetail.markingPriceWithIva = iva;

                //* CALCULAR EL 4X1000
                let value4x1000: number = totalMarking * 0.004 || 0;
                totalMarking += value4x1000;
                totalCost += value4x1000;
                updatedQuoteDetail.markingPriceWith4x1000 = value4x1000;
              };

              //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
              const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
              totalMarking += marginForDialingServices;

              //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
              markingService.markingTransportPrice = markingTransportPrice;
              totalMarking += markingTransportPrice;
              totalCost += markingTransportPrice;
              updatedQuoteDetail.markingWithProductSupplierTransport += markingTransportPrice;

              //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
              const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice || 0;
              totalMarking += supplierFinancingPercentage;

              markingService.markingTransportPrice = (markingTransportPrice + supplierFinancingPercentage) || 0;
              markingService.calculatedMarkingPrice = totalMarking;

              await this.markingServicePropertyRepository.save(markingService);
            };
          };
        };
      };
    };

    //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
    const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice || 0;
    totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage) || 0;

    updatedQuoteDetail.totalPriceWithTransport = (updatedQuoteDetail.unitPrice + totalTransportPrice) || 0;
    updatedQuoteDetail.transportTotalPrice += totalTransportPrice || 0;

    //* CALCULAR EL 4X1000 PARA PAGAR SERVICIOS DE ENTREGA
    let value4x1000: number = totalPrice * 0.004 || 0;
    totalPrice += value4x1000;
    totalCost += value4x1000;
    updatedQuoteDetail.transportServices4x1000 = value4x1000;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      totalPrice += mainClient?.margin;
    };

    totalPrice += cartQuote?.client?.margin || 0;

    //* SE DEBE ADICIONAR UN FEE ADICIONAL AL USUARIO DENTRO DEL CLIENTE
    if (clientUser) {
      if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
        clientType = 'cliente corporativo secundario';
      else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
        clientType = 'cliente corporativo principal';
    };

    if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
      const brandId = cartQuote.brandId;

      if (brandId != '') {
        const cartQuoteBrand: Brand = await this.brandRepository.findOne({
          where: {
            id: brandId,
          },
        });

        if (!cartQuoteBrand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (cartQuote.client.user.brands.some(brand => brand.id == cartQuoteBrand.id)) {
          const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;

          totalPrice += fee;
          totalCost += fee;
          updatedQuoteDetail.aditionalClientFee = fee;
          cartQuote.fee = fee;
        };
      };
    };

    //* ADICIONAR EL % DE MARGEN DE GANANCIA POR PERIODO Y POLÍTICA DE PAGO DEL CLIENTE
    const profitMargin: number = 0;

    const paymentDays = [
      {
        day: 1,
        percentage: 0.03,
      },
      {
        day: 15,
        percentage: 0.03,
      },
      {
        day: 30,
        percentage: 0.03,
      },
      {
        day: 45,
        percentage: 0.04,
      },
      {
        day: 60,
        percentage: 0.06,
      },
      {
        day: 90,
        percentage: 0.09,
      },
    ];


    //* SI EL CLIENTE ES SECUNDARIO
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      const marginProfit: number = mainClient.margin || 0;
      const paymentTerms: number = mainClient.paymentTerms || 0;



      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      // Precio original * (1 - Descuento individual) * (1 - Descuento general)

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SI EL CLIENTE ES PRINCIPAL
    if (clientType == 'cliente corporativo principal') {
      const margin: number = cartQuoteClient.margin || 0;
      const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
    let additionalDisccount: number = updatedQuoteDetail.additionalDiscount > 0 ? totalPrice * (1 - updatedQuoteDetail.additionalDiscount) : 0;
    totalPrice -= additionalDisccount;
    updatedQuoteDetail.totalAdditionalDiscount = additionalDisccount || 0;

    //* PRECIO TOTAL ANTES DE IVA (YA HECHO)
    updatedQuoteDetail.subTotal = totalPrice;
    updatedQuoteDetail.totalValueWithoutIva = totalPrice;

    //* IVA DE LA VENTA
    const iva: number = (product.iva / 100) * totalPrice || 0;
    updatedQuoteDetail.iva = iva;
    totalPrice += iva;
    totalCost += iva;

    //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
    Math.round(updatedQuoteDetail.totalValue);

    //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE
    const withholdingAtSource: number = systemConfig.withholdingAtSource || 0;
    const withholdingAtSourceValue: number = (totalPrice * withholdingAtSource / 100) || 0;

    totalPrice += withholdingAtSourceValue;
    updatedQuoteDetail.withholdingAtSourceValue = withholdingAtSourceValue;
    totalCost += withholdingAtSourceValue;
    cartQuoteDb.withholdingAtSourceValue = withholdingAtSourceValue;

    //* CALCULAR UTILIDAD DEL NEGOCIO
    const businessUtility = (totalPrice - (totalCost - withholdingAtSourceValue)) || 0;
    updatedQuoteDetail.businessUtility = businessUtility;

    // //* CALCULAR DESCUENTO
    const discount: number = (updatedQuoteDetail.discount / 100) * totalPrice || 0;
    updatedQuoteDetail.discount = discount;
    // totalPrice -= discount;

    //* CALCULAR SUBTOTAL CON DESCUENTO
    updatedQuoteDetail.subTotalWithDiscount = (updatedQuoteDetail.subTotal - additionalDisccount) || 0;
    updatedQuoteDetail.totalCost = totalCost;
    updatedQuoteDetail.totalValue = totalPrice;

    //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
    const businessMarginProfit: number = (totalPrice - updatedQuoteDetail.totalValueWithoutIva);
    updatedQuoteDetail.businessMarginProfit = businessMarginProfit;
    cartQuoteDb.totalPrice += totalPrice;

    //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
    updatedQuoteDetail.maximumDiscount = 20;

    Object.assign(quoteDetail, updatedQuoteDetail);

    let updatedCartQuote: CartQuote = cartQuoteDb;

    // if (saveData == 1) {
    //   updatedCartQuote = await this.cartQuoteRepository.save(cartQuoteDb);
    //   await this.quoteDetailRepository.save(quoteDetail);
    // }

    return {
      quoteDetail,
      updatedCartQuote
    };
  }

  async desactivate(id: string) {
    const { quoteDetail } = await this.findOne(id);

    quoteDetail.isActive = !quoteDetail.isActive;

    await this.quoteDetailRepository.save(quoteDetail);

    return {
      quoteDetail
    };
  }

  async remove(id: string) {
    const { quoteDetail } = await this.findOne(id);

    await this.quoteDetailRepository.remove(quoteDetail);

    return {
      quoteDetail
    };
  }

  async calculateSamplePrice(data: QuoteDetail, systemConfig: SystemConfig, quantity: number) {
    const newQuoteDetail: QuoteDetail = data;
    const product: Product = newQuoteDetail.product;
    let samplePrice: number = product.samplePrice || 0;

    //* CALCULAR LA CANTIDAD DE CAJAS PARA LAS UNIDADES COTIZADAS
    const packing: Packing = product.packings[0] || undefined;
    const packingUnities: number = product.packings ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    let totalPackingVolume: number = 0;
    let packingWeight: number = 0;

    if (packingUnities > 0 && packingUnities != undefined) {
      let boxesQuantity: number = (quantity / packingUnities);

      boxesQuantity = Math.round(boxesQuantity) + 1;

      //* CALCULAR EL VOLUMEN DEL PAQUETE
      const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
      const totalVolume: number = (packingVolume * boxesQuantity) || 0;
      totalPackingVolume = totalVolume || 0;

      //* CALCULAR EL PESO DEL PAQUETE
      packingWeight = (packing?.smallPackingWeight * boxesQuantity) || 0;
    }

    //* APLICAR IVA
    if (product.iva > 0 || product.iva != undefined) {
      const iva: number = (product.iva / 100) * samplePrice;

      samplePrice += iva;
    };

    //* VERIFICAR SI ES IMPORTADO NACIONAL
    if (product.importedNational.toLowerCase() == 'importado') {
      const importationFee: number = (systemConfig.importationFee / 100) * samplePrice;

      samplePrice += importationFee;
    };

    //* VERIFICAR SI TIENE FEE DE IMPREVISTOS
    if (product.unforeseenFee > 0) {
      const unforeseenFee: number = (product.unforeseenFee / 100) * samplePrice;

      samplePrice += unforeseenFee;
    };

    const unforeseenFee: number = systemConfig.unforeseenFee || 0;
    const unforeseenFeePercentage: number = (unforeseenFee / 100) * samplePrice || 0;
    samplePrice += unforeseenFeePercentage;

    //TODO: Validar calculos de ganacias por periodos y politicas de tienpos de entrega
    //TODO: Después del margen del periodo validar del comercial


    //* IDENTIFICAR TIEMPO DE ENTREGA ACORDE AL PRODUCTO
    const availableUnits: number = product?.availableUnit || 0;
    let deliveryTimeToSave: number = 0;

    if (quantity > availableUnits) {
      product.refProduct.deliveryTimes.forEach((deliveryTime: DeliveryTime) => {
        if (deliveryTime?.minimum >= quantity && deliveryTime?.minimumAdvanceValue == 1 && deliveryTime?.maximum <= quantity || deliveryTime?.minimum >= quantity && deliveryTime?.minimumAdvanceValue == 0) {
          deliveryTimeToSave = deliveryTime?.timeInDays || 0;
          return;
        }
      });
    } else if (availableUnits > 0 && quantity < availableUnits) {
      deliveryTimeToSave = product?.refProduct?.productInventoryLeadTime || 0;
    };

    //* IDENTIFICAR PORCENTAJE DE ANTICIPIO DE PROVEEDOR
    const advancePercentage: number = product?.refProduct?.supplier?.advancePercentage || 0;
    samplePrice += advancePercentage;

    //* CALCULAR COSTOS FINANCIEROS DEL PERIODO DE PRODUCCIÓN
    const supplierFinancingPercentage: number = systemConfig.supplierFinancingPercentage || 0;
    const financingCost: number = ((samplePrice - advancePercentage) * supplierFinancingPercentage) * deliveryTimeToSave;
    samplePrice += financingCost;

    //* OBTENER LOS PRECIOS LOCALES DE TRANSPORTE
    let localTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* CALCULAR EL COSTO DE TRANSPORTE Y ENTREGA DE LOS PRODUCTOS (ESTA INFORMACIÓN VIENE DEL API DE FEDEX)
    const localTransportPrice: LocalTransportPrice | undefined = localTransportPrices.length > 0
      ? localTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalPackingVolume);
        const diffB = Math.abs(b.volume - totalPackingVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: transportOrigin, destination: transportDestination, price: transportPrice, volume: transportVolume } = localTransportPrice || { origin: '', destination: '', price: 0, volume: 0 };

    samplePrice += transportPrice;

    //TODO: ASIGNAR EL VALOR DEL PRECIO DEL TRANSPORTE A ALGO

    //* CALCULAR EL IMPUESTO 4 X 1000
    samplePrice += (samplePrice * 1.04);

    //* CALCULAR EL COSTO DE LA OPERACIÓN (YA HECHO)

    //* ADICIONAR EL % DE MARGEN DE GANANCIA SOBRE EL PROVEEDOR
    samplePrice += product?.refProduct?.supplier?.profitMargin || 0;

    //* ADICIONAR EL % DE MARGEN DE GANANCIA DEL PRODUCTO
    const mainCategory: CategorySupplier = await this.categorySupplierRepository.findOne({
      where: {
        id: product?.refProduct?.mainCategory,
      },
    });

    if (mainCategory) {
      samplePrice += +mainCategory?.categoryTag?.categoryMargin || 0;
    };

    const clientCompanyDestination: string = newQuoteDetail?.cartQuote?.client?.user?.company?.city;

    //* SI EL DESTINO ES BOGOTÁ
    if (clientCompanyDestination.toLowerCase().trim() != 'bogota') {
      //TODO: HACER CALCULO DE FEDEX

    } else {
      samplePrice += transportPrice;
    };

    return samplePrice;
  }































  // async updateUp(id: string, updateQuoteDetailDto: CreateQuoteDetailDto, save: number, user: User,) {
  //   let saveData: number = 0;

  //   if (save) {
  //     saveData = save;
  //   };

  //   console.log(updateQuoteDetailDto)

  //   const hasSample: boolean = updateQuoteDetailDto.hasSample;

  //   console.log(hasSample)

  //   const quoteDetail: QuoteDetail = await this.quoteDetailRepository.findOne({
  //     where: {
  //       id,
  //     },
  //     relations: [
  //       'cartQuote',
  //       'cartQuote.client',
  //       'cartQuote.client.user',
  //       'cartQuote.client.user.company',
  //       'cartQuote.client.user.brands',
  //       'product.packings',
  //       'product.refProduct',
  //       'product.refProduct.images',
  //       'product.refProduct.packings',
  //       'product.refProduct.supplier',
  //       'product.refProduct.supplier.disccounts',
  //       'product.refProduct.supplier.disccounts.disccounts',
  //       'markingServices',
  //       'markingServices.logos',
  //       'markingServices.externalSubTechnique',
  //       'markingServices.marking',
  //       'markingServices.markingServiceProperty',
  //       'markingServices.markingServiceProperty.markedServicePrices',
  //     ],
  //   });


  //   console.log(quoteDetail)
  //   console.log(quoteDetail.totalValue)

  //   if (!quoteDetail)
  //     throw new NotFoundException(`Quote detail with id ${id} not found`);

  //   const updatedQuoteDetail = plainToClass(QuoteDetail, quoteDetail);

  //   if (updateQuoteDetailDto.quantities) {
  //     updatedQuoteDetail.quantities = updateQuoteDetailDto.quantities;
  //   };

  //   if (updateQuoteDetailDto.discount) {
  //     updatedQuoteDetail.discount = updateQuoteDetailDto.discount;
  //     updatedQuoteDetail.discountPercentage = updateQuoteDetailDto.discount;
  //   };

  //   const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
  //     where: {
  //       id: quoteDetail.cartQuote.id,
  //     }
  //   });

  //   const product: Product = quoteDetail.product;
  //   const cartQuote: CartQuote = quoteDetail.cartQuote;

  //   if (!cartQuoteDb)
  //     throw new NotFoundException(`Cart quote with id ${quoteDetail.cartQuote.id} not found`);

  //   cartQuoteDb.productsQuantity += quoteDetail.quantities || 0;

  //   console.log(cartQuoteDb.totalPrice)
  //   cartQuoteDb.totalPrice -= quoteDetail.totalValue
  //   cartQuoteDb.totalPrice += updatedQuoteDetail.total || 0;
  //   cartQuoteDb.productsQuantity += updatedQuoteDetail.quantities || 0;

  //   console.log(cartQuoteDb.totalPrice)


  //   //* ------------- CALCULOS ------------- *//
  //   const quantity: number = updateQuoteDetailDto.quantities || 0;
  //   let totalPrice: number = updateQuoteDetailDto.unitPrice || 0;
  //   let totalTransportPrice: number = 0;
  //   let totalCost: number = 0;
  //   let productVolume: number = 0;
  //   let totalVolume: number = 0;


  //   console.log(quantity)
  //   console.log(totalPrice)

  //   // DATOS A FUTURO PARA CALCULAR TRANSPORTES

  //   //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
  //   const markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
  //     .createQueryBuilder('localTransportPrice')
  //     .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
  //     .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
  //     .getMany();

  //   //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
  //   const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
  //     .createQueryBuilder('localTransportPrice')
  //     .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
  //     .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
  //     .getMany();

  //   //TODO: UTILIZAR LA API DE FEDEX
  //   //TODO: UTILIZAR LA API DE FEDEX

  //   //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
  //   const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
  //   const systemConfig: SystemConfig = systemConfigDb[0];









  //   //* SE SOLICITA MUESTRA
  //   let ValorMuestraIndividual = 0;
  //   let TotalMuestra = 0;
  //   let TransporteMuestra = 0;
  //   let TotalGastoMuestra = 0;
  //   let CuatroPorMilMuestra = 0;
  //   let CostoTotalMuestra = 0
  //   let IvaMuestra = 0;
  //   let ValorTotalDeTransporteGeneral = 0;

  //   if (hasSample) {

  //     //* CALCULAR EL PRECIO DE LA MUESTRA

  //     updatedQuoteDetail.hasSample = true;
  //     const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;
  //     updatedQuoteDetail.sampleValue = 0;

  //     if (!productHasFreeSample) {
  //       const samplePrice: number = product?.samplePrice || 0;
  //       ValorMuestraIndividual = samplePrice;
  //       if (samplePrice <= 0) {
  //         const referencePrice: number = product?.referencePrice || 0;
  //         totalPrice += referencePrice;
  //         ValorMuestraIndividual = referencePrice;
  //       };
  //       console.log(ValorMuestraIndividual)



  //       // IVA A LA MUESTRA

  //       if (product.iva > 0 || product.iva != undefined) {
  //         IvaMuestra = (product.iva / 100) * ValorMuestraIndividual;
  //         totalPrice += IvaMuestra;
  //         // console.log(totalPrice)
  //       };

  //       if (product.iva == 0) {
  //         IvaMuestra = (19 / 100) * ValorMuestraIndividual;
  //         totalPrice += IvaMuestra;
  //         // console.log(totalPrice)
  //       }
  //       console.log(IvaMuestra)


  //       // TOTAL MUESTRA === VARIABLE GLOBAL
  //       TotalMuestra = ValorMuestraIndividual + IvaMuestra;
  //       console.log(TotalMuestra)


  //       // Transporte de la Muestra
  //       if (updatedQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
  //         const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
  //           ? markingTransportPrices.sort((a, b) => {
  //             const diffA = Math.abs(a.volume - totalVolume);
  //             const diffB = Math.abs(b.volume - totalVolume);
  //             return diffA - diffB;
  //           })[0]
  //           : undefined;

  //         const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

  //         totalPrice += clientTransportPrice;

  //         // updatedQuoteDetail.transportTotalPrice = 0;
  //         // updatedQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
  //         // updatedQuoteDetail.sampleValue += clientTransportPrice || 0;

  //         TransporteMuestra = clientTransportPrice;

  //       } else {
  //         //TODO: FEDEX
  //         TransporteMuestra = 15000;
  //         // updatedQuoteDetail.transportTotalPrice += TransporteMuestra;
  //       }

  //       // SUMA CONTONIA DEL TRANSPORTE TOTAL
  //       // ValorTotalDeTransporteGeneral += TransporteMuestra,
  //       updatedQuoteDetail.sampleTransportValue = TransporteMuestra;

  //       // TOTAL GASTOS MUESTRA === VARIABLE GLOBAL
  //       TotalGastoMuestra = TotalMuestra + TransporteMuestra;


  //       // CUATRO POR MIL MUESTRA 
  //       CuatroPorMilMuestra = TotalGastoMuestra * 0.004 || 0;
  //       updatedQuoteDetail.transportServices4x1000 = CuatroPorMilMuestra;
  //       console.log(CuatroPorMilMuestra)


  //       // COSTO TOTAL MUESTRA === VARIABLE GLOBAL
  //       CostoTotalMuestra = TotalGastoMuestra + CuatroPorMilMuestra;
  //       console.log(CostoTotalMuestra)

  //       // totalPrice += samplePrice;
  //       updatedQuoteDetail.sampleValue = CostoTotalMuestra;
  //       // updatedQuoteDetail.sampleValue = referencePrice;

  //     };
  //   } else {
  //     updatedQuoteDetail.hasSample = false;
  //   };











  //   // CALCULOS DEL TRANSPORTE

  //   //* CALCULAR EL VOLUMEN DEL PRODUCTO
  //   productVolume = (product?.height * product?.weight * product?.large) || 0;

  //   //* DATOS DEL CLIENTE
  //   const cartQuoteClient: Client = cartQuote?.client;
  //   const clientUser: User = cartQuote?.client?.user;
  //   let clientType: string = '';

  //   //* PRECIO ESCOGIDO EN EL DETALLE DEL PRODUCTO ANTES DEL CARRITO
  //   const burnQuantity: number = updatedQuoteDetail?.unitPrice || 0;
  //   totalCost += burnQuantity;
  //   // updatedQuoteDetail.transportTotalPrice = 0;



  //   //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
  //   const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
  //   const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

  //   //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
  //   let boxesQuantity: number = (quantity / packingUnities) || 0;

  //   boxesQuantity = Math.round(boxesQuantity) + 1 || 0;

  //   //* CALCULAR EL VOLUMEN DEL PAQUETE
  //   const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
  //   totalVolume = (packingVolume * boxesQuantity) || 0;

  //   //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
  //   const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
  //     ? markingTransportPrices.sort((a, b) => {
  //       const diffA = Math.abs(a.volume - totalVolume);
  //       const diffB = Math.abs(b.volume - totalVolume);
  //       return diffA - diffB;
  //     })[0]
  //     : undefined;

  //   const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

  //   //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
  //   const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
  //     ? markingTransportPrices.sort((a, b) => {
  //       const diffA = Math.abs(a.volume - totalVolume);
  //       const diffB = Math.abs(b.volume - totalVolume);
  //       return diffA - diffB;
  //     })[0]
  //     : undefined;

  //   const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };


  //   // COSTO TRANSPORTE DE ENTREGA
  //   const CostoTransporteDeEntrega = clientTransportPrice;
  //   console.log(CostoTransporteDeEntrega)


  //   // CUATRO POR MIL TRANSPORTE 
  //   let CuatroPorMilTransporte = 0;
  //   CuatroPorMilTransporte = CostoTransporteDeEntrega * 0.004 || 0;
  //   console.log(CuatroPorMilTransporte)

  //   // COSTO TOTAL TRANSPORTE DE ENTREGA
  //   const CostoTotalTransporteDeEntrega = CostoTransporteDeEntrega + CuatroPorMilTransporte;
  //   console.log(CostoTotalTransporteDeEntrega)


  //   // SUMA CONTONIA DEL TRANSPORTE TOTAL
  //   // ValorTotalDeTransporteGeneral += (CostoTotalTransporteDeEntrega)









  //   // INICIO CALCULO DE SERVICIO DE MARCACIÓN
  //   let ValorTotalMarcacion = 0;
  //   let valorTransporteMarcacion = 0;

  //   const markingServices: MarkingService[] = updatedQuoteDetail?.markingServices || [];
  //   console.log(markingServices)


  //   // console.log(updatedQuoteDetail.markingServices.length)
  //   // if (updatedQuoteDetail.markingServices.length > 0) {
  //   //   // Guardamos las markin que vengan del carrito
  //   //   let MarcasExistentes: MarkingService[] = await this.markingServiceRepository.find({
  //   //     where: {
  //   //       quoteDetail: { id },
  //   //     },
  //   //     relations: [
  //   //       'marking',
  //   //       'logos',
  //   //       'quoteDetail',
  //   //     ],
  //   //   });

  //   //   console.log(MarcasExistentes);


  //   //   //Eliminar logos
  //   //   for (const markingServiceUno of MarcasExistentes) {
  //   //     console.log(markingServiceUno)

  //   //     for (const logo of markingServiceUno.logos) {
  //   //       const logoId:any = logo?.id;
  //   //       console.log(logoId)
  //   //       const logoToRemove = await this.LogoService.findOne(logoId); 
  //   //       console.log(logoToRemove)

  //   //       if (logoToRemove) {
  //   //           await this.LogoService.remove(logoToRemove);
  //   //       } else {
  //   //           console.log(`No se encontró el logo con ID: ${logoId}`);
  //   //       }

  //   //     }

  //   //     console.log(markingServiceUno.id)
  //   //     let id: any = markingServiceUno.id || ''; 
  //   //     await this.markingServiceRepository.remove(markingServiceUno);
  //   //   };
  //   // }


  //   //* Buscamos los datos de la referencia
  //   const quoteDetailRefProduct: RefProduct = product.refProduct;
  //   console.log(quoteDetailRefProduct);
  //   let marking: Marking;

  //   // Preguntamos si es personalizable ?
  //   if (quoteDetailRefProduct?.personalizableMarking == 1) {

  //     if (markingServices || markingServices.length > 0) {
  //       console.log(markingServices)
  //       for (const markingService of markingServices) {
  //         let markingServicePropertyPrice: number = 0;

  //         const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;
  //         console.log(markingServiceProperty)
  //         for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
  //           //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
  //           console.log(quantity)
  //           // if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange > quantity) {
  //           if (quantity >= markedServicePrice.minRange && quantity <= markedServicePrice.maxRange) {

  //             console.log(markedServicePrice.unitPrice)

  //             let totalMarking: number = (quantity * markedServicePrice.unitPrice);
  //             updatedQuoteDetail.markingTotalPrice = totalMarking;

  //             // marking = markingServiceProperty?.externalSubTechnique?.marking;
  //             marking = markingService?.marking;
  //             console.log(totalMarking)

  //             //* SI EL SERVICIO DE MARCADO TIENE IVA
  //             if (marking.iva > 0) {
  //               //* CALCULAR EL IVA
  //               const iva: number = (marking.iva / 100) * totalMarking || 0;
  //               totalMarking += iva;
  //               totalCost += iva;
  //               updatedQuoteDetail.markingPriceWithIva = iva;

  //               //* CALCULAR EL 4X1000
  //               let value4x1000: number = totalMarking * 0.004 || 0;
  //               totalMarking += value4x1000;
  //               totalCost += value4x1000;
  //               updatedQuoteDetail.markingPriceWith4x1000 = value4x1000;
  //             };

  //             //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
  //             const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
  //             totalMarking += marginForDialingServices;

  //             //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
  //             markingService.markingTransportPrice = markingTransportPrice;
  //             totalMarking += markingTransportPrice;
  //             totalCost += markingTransportPrice;

  //             valorTransporteMarcacion += markingTransportPrice;

  //             //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
  //             const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice || 0;
  //             totalMarking += supplierFinancingPercentage;

  //             markingService.markingTransportPrice = (markingTransportPrice + supplierFinancingPercentage) || 0;
  //             markingService.calculatedMarkingPrice = totalMarking;

  //             ValorTotalMarcacion += totalMarking;

  //             updatedQuoteDetail.markingWithProductSupplierTransport = markingTransportPrice;


  //             await this.markingServiceRepository.save(markingService); //descomentar
  //             // await this.markingServicePropertyRepository.save(markingService);
  //           };
  //         };
  //       };
  //     };
  //   };





















  //   // COTO TRANSPORTE MARCACIÓN ==== VARIABLE GLOBAL 
  //   console.log(valorTransporteMarcacion)


  //   //SUBTOTAL COSTO MARCACIÓN
  //   let SubTotalCostoMarcacion = ValorTotalMarcacion || 0;
  //   SubTotalCostoMarcacion = Math.round(SubTotalCostoMarcacion)
  //   console.log(SubTotalCostoMarcacion)


  //   //* CALCULAR EL IVA

  //   let IvaMarcacion: number = (19 / 100) * SubTotalCostoMarcacion;
  //   IvaMarcacion = Math.round(IvaMarcacion)
  //   console.log(IvaMarcacion)


  //   // TOTAL COSTO MARCACIÓN

  //   let TotalCostoMarcacion = SubTotalCostoMarcacion + IvaMarcacion + valorTransporteMarcacion;
  //   TotalCostoMarcacion = Math.round(TotalCostoMarcacion)
  //   console.log(TotalCostoMarcacion)


  //   //* CALCULAR EL 4X1000

  //   let CuatroPorMilMarcacion: number = TotalCostoMarcacion * 0.004 || 0;
  //   CuatroPorMilMarcacion = Math.round(CuatroPorMilMarcacion)
  //   console.log(CuatroPorMilMarcacion)

  //   //COSTO TOTAL MARCACIÓN

  //   let CostoTotalMarcacion = TotalCostoMarcacion + CuatroPorMilMarcacion;
  //   CostoTotalMarcacion = Math.round(CostoTotalMarcacion)
  //   console.log(CostoTotalMarcacion)


  //   // SUBTOTAL

  //   let SubTotal = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra + CostoTotalTransporteDeEntrega + SubTotalCostoMarcacion + CuatroPorMilMarcacion;
  //   SubTotal = Math.round(SubTotal)
  //   console.log(SubTotal)

  //   // IVA SUBTOTAL

  //   let IvaSubtotal = IvaMuestra + IvaMarcacion;
  //   IvaSubtotal = Math.round(IvaSubtotal)
  //   console.log(IvaSubtotal)


  //   // TOTAL GASTOS DE ADICIONALES

  //   let TotalGastosAdicionales = CostoTotalMuestra + CostoTotalTransporteDeEntrega + CostoTotalMarcacion;
  //   TotalGastosAdicionales = Math.round(TotalGastosAdicionales)
  //   console.log(TotalGastosAdicionales)









  //   // SECCION INGRESOS POR ADICIONALES		=========================================================> 


  //   // MARGEN DE LA CATEGORIA
  //   const mainCategoryTag: CategoryTag = await this.categoryTagRepository.findOne({
  //     where: {
  //       id: product?.refProduct?.tagCategory,
  //     },
  //   });

  //   //* MARGEN DE GANANCIA DEL PROVEEDOR
  //   const profitMarginSupplier: number = product?.refProduct?.supplier?.profitMargin || 0;


  //   // PRECIO DE VENTA SIN IVA (TABLA QUEMADA) === VARIABLE GLOBAL 
  //   // let PrecioVentaSinIva = 0;
  //   // if (mainCategoryTag) {
  //   //   const sumaProcentajes = (1 + (+mainCategoryTag.categoryMargin + profitMargin) / 100)
  //   //   PrecioVentaSinIva = (SubTotalAntesDeIva * sumaProcentajes) ;

  //   //   //* REDONDEANDO DECIMALES
  //   //   PrecioVentaSinIva = Math.round(PrecioVentaSinIva);
  //   //   console.log(PrecioVentaSinIva)
  //   // };

  //   //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
  //   // const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice || 0;
  //   // totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage) || 0;

  //   // updatedQuoteDetail.totalPriceWithTransport = (updatedQuoteDetail.unitPrice + totalTransportPrice) || 0;
  //   // updatedQuoteDetail.transportTotalPrice += totalTransportPrice || 0;

  //   // //* CALCULAR EL 4X1000 PARA PAGAR SERVICIOS DE ENTREGA
  //   // let value4x1000: number = totalPrice * 0.004 || 0;
  //   // totalPrice += value4x1000;
  //   // totalCost += value4x1000;
  //   // updatedQuoteDetail.transportServices4x1000 = value4x1000;




  //   //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
  //   let MargenCliente = 0;
  //   let MargenPorFinanciacion = 0;
  //   if (clientType == 'cliente corporativo secundario') {
  //     //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
  //     const mainClient: Client = await this.clientRepository
  //       .createQueryBuilder('client')
  //       .leftJoinAndSelect('client.user', 'clientUser')
  //       .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
  //       .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
  //       .leftJoinAndSelect('clientUserCompany.users', 'companyUsers')
  //       .andWhere('companyUsers.isCoorporative =:isCoorporative', { isCoorporative: 1 })
  //       .andWhere('companyUsers.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
  //       .getOne();

  //     totalPrice += mainClient?.margin;
  //     MargenCliente = mainClient?.margin;
  //     console.log(MargenCliente)
  //   } else {
  //     MargenCliente = 10;
  //     console.log(MargenCliente)

  //   };

  //   totalPrice += cartQuote?.client?.margin || 0;


  //   // DEFINIR EL TIPO DE CLIENTE QUE ES EL CLIENTE
  //   if (clientUser) {
  //     if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
  //       clientType = 'cliente corporativo secundario';
  //     else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
  //       clientType = 'cliente corporativo principal';
  //   };


  //   // nuevo Yeison
  //   let financeCostProfist: any = await this.systemFinancingCostProfit.find();
  //   console.log(financeCostProfist)




  //   // DIAS DE PAGO DEL CLIENTE CORPOATIV
  //   let DiasPagoClienteCorporativo = 0;


  //   //* MARGEN POR FINANCIACIÓN 
  //   // const MargenPorFinanciacion: number = 0;

  //   let paymentDays: any[] = [];
  //   for (const paymentDate of financeCostProfist) {
  //     let data = {
  //       day: paymentDate.days,
  //       percentage: paymentDate.financingPercentage / 100,
  //     }

  //     paymentDays.push(data)
  //   }



  //   console.log(paymentDays)


  //   // const paymentDays = [
  //   //   {
  //   //     day: 1,
  //   //     percentage: 0.03,
  //   //   },
  //   //   {
  //   //     day: 15,
  //   //     percentage: 0.03,
  //   //   },
  //   //   {
  //   //     day: 30,
  //   //     percentage: 0.03,
  //   //   },
  //   //   {
  //   //     day: 45,
  //   //     percentage: 0.04,
  //   //   },
  //   //   {
  //   //     day: 60,
  //   //     percentage: 0.06,
  //   //   },
  //   //   {
  //   //     day: 90,
  //   //     percentage: 0.09,
  //   //   },
  //   // ];



  //   // Días de pago de Cliente NO Corporativo
  //   const day60 = paymentDays.find(item => item.day === 1);
  //   // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
  //   DiasPagoClienteCorporativo = day60 ? day60.day : 0;
  //   MargenPorFinanciacion = day60 ? day60.percentage : 0;
  //   console.log(MargenPorFinanciacion)


  //   let marginProfit: number = 0;

  //   marginProfit = systemConfig.noCorporativeClientsMargin;


  //   //* SI EL CLIENTE ES SECUNDARIO
  //   if (clientType == 'cliente corporativo secundario') {
  //     //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
  //     const mainClient: Client = await this.clientRepository
  //       .createQueryBuilder('client')
  //       .leftJoinAndSelect('client.user', 'clientUser')
  //       .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
  //       .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
  //       .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
  //       .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
  //       .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
  //       .getOne();

  //     marginProfit = mainClient.margin || 0;
  //     const paymentTerms: number = mainClient.paymentTerms || 0;

  //     //Capturamos los dias fr pago del cliente corporativo.
  //     DiasPagoClienteCorporativo = paymentTerms || 0;

  //     let percentageDiscount: number = 0;

  //     paymentDays.forEach(paymentDay => {
  //       if (paymentDay.day == paymentTerms) {
  //         percentageDiscount = paymentDay.percentage;
  //       };
  //     });

  //     // Precio original * (1 - Descuento individual) * (1 - Descuento general)
  //     MargenPorFinanciacion = percentageDiscount;

  //     let value: number = totalPrice * (1 - percentageDiscount);
  //     totalPrice = Math.round(value);
  //   };

  //   //* SI EL CLIENTE ES PRINCIPAL
  //   if (clientType == 'cliente corporativo principal') {
  //     const margin: number = cartQuoteClient.margin || 0;
  //     marginProfit = margin;
  //     const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

  //     //Capturamos los dias fr pago del cliente corporativo.
  //     DiasPagoClienteCorporativo = paymentTerms || 0;

  //     let percentageDiscount: number = 0;

  //     paymentDays.forEach(paymentDay => {
  //       if (paymentDay.day == paymentTerms) {
  //         percentageDiscount = paymentDay.percentage;
  //       };
  //     });

  //     MargenPorFinanciacion = percentageDiscount;

  //     let value: number = totalPrice * (1 - percentageDiscount);
  //     totalPrice = Math.round(value);
  //   };

  //   console.log(DiasPagoClienteCorporativo)
  //   console.log(marginProfit)

  //   let SumaInicial: number = 0;
  //   SumaInicial = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra;
  //   console.log(SumaInicial)


  //   let sumaSecundaria: number = 0;
  //   sumaSecundaria = (1 + (+mainCategoryTag.categoryMargin + profitMarginSupplier) / 100)
  //   console.log(sumaSecundaria)


  //   let sumaTerciaria: number = 0;
  //   sumaTerciaria = (1 + (MargenCliente + MargenPorFinanciacion) / 100)
  //   console.log(sumaTerciaria)


  //   // SUBTOTAL ==== VARIABLE GLOBAL
  //   let SubtotalIngresosAdicionales = (SumaInicial * sumaSecundaria) * sumaTerciaria;

  //   SubtotalIngresosAdicionales = Math.round(SubtotalIngresosAdicionales);
  //   console.log(SubtotalIngresosAdicionales)



  //   // MARCA Y/O FEE DEL CLIENTE DEL CARRITO == VARIABLE GLOBAL 
  //   let feeMarcaCliente = 0;

  //   if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
  //     const brandId = cartQuote.brandId;

  //     if (brandId != '') {
  //       const cartQuoteBrand: Brand = await this.brandRepository.findOne({
  //         where: {
  //           id: brandId,
  //         },
  //       });

  //       if (!cartQuoteBrand)
  //         throw new NotFoundException(`Brand with id ${brandId} not found`);

  //       if (cartQuote.client.user.brands.some(brand => brand.id == cartQuoteBrand.id)) {
  //         const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;
  //         feeMarcaCliente = +cartQuoteBrand.fee;
  //         totalPrice += fee;
  //         totalCost += fee;
  //         updatedQuoteDetail.aditionalClientFee = fee;
  //         cartQuote.fee = fee;
  //       };
  //     };
  //   };








  //   // =========================== CALCULO FEE MUESTRA


  //   // ======== CALCULO FEE ITERATIVO MUESTRA
  //   let calculoMagenes = (1 + (marginProfit + MargenPorFinanciacion) / 100);
  //   let feeDecimal = 1 + (feeMarcaCliente / 100);

  //   let valorBase = SubtotalIngresosAdicionales;

  //   let F29 = SubtotalIngresosAdicionales;
  //   let F6 = marginProfit / 100;
  //   let F7 = MargenPorFinanciacion;
  //   let F8 = feeMarcaCliente / 100;

  //   let primerCalculo = F29 * (1 + F6 + F7) * F8;
  //   let segundoCalculo = primerCalculo * F8;
  //   let tercerCalculo = segundoCalculo * F8;
  //   let cuartoCalculo = tercerCalculo * F8;

  //   let resultado = primerCalculo + segundoCalculo + tercerCalculo + cuartoCalculo;
  //   let FeeMuestraTotalCalculado = resultado;
  //   FeeMuestraTotalCalculado = Math.round(FeeMuestraTotalCalculado);
  //   console.log(FeeMuestraTotalCalculado)
  //   // ======== FIN CALCULO FEE ITERATIVO MUESTRA


  //   // SUBTOTAL
  //   let SubTotalFeeMuestra = SubtotalIngresosAdicionales + FeeMuestraTotalCalculado;
  //   SubTotalFeeMuestra = Math.round(SubTotalFeeMuestra);
  //   console.log(SubTotalFeeMuestra)


  //   //* CALCULAR EL IVA yeison
  //   let IvaSubTotal: number = (19 / 100) * SubTotalFeeMuestra;
  //   IvaSubTotal = Math.round(IvaSubTotal);
  //   console.log(IvaSubTotal)


  //   // TOTAL PRECIO MUESTRA CON IVA
  //   let TotalPrecioMuestraConIva = SubTotalFeeMuestra + IvaSubTotal;
  //   TotalPrecioMuestraConIva = Math.round(TotalPrecioMuestraConIva);
  //   console.log(TotalPrecioMuestraConIva)












  //   // =========================== CALCULO FEE TRANSPORTE

  //   // MARGEN DEL TRANSPORTE (PARAMETRIZACION)
  //   const marginForTransportServices: number = systemConfig.marginForTransportServices || 0;


  //   console.log(marginForTransportServices)
  //   // Convertimos los porcentajes a valores decimales
  //   let maerginTrans = (marginForTransportServices) / 100;
  //   let marginCli = (marginProfit) / 100;
  //   let marginFian = (MargenPorFinanciacion);

  //   console.log(marginCli)
  //   console.log(marginFian)
  //   console.log(maerginTrans)
  //   console.log(CostoTotalTransporteDeEntrega)
  //   console.log(marginFian)

  //   let alculoSubTotalInicial = valorTransporteMarcacion + SubTotalCostoMarcacion + CuatroPorMilMarcacion;

  //   let sumaF6F7 = marginCli + marginFian;
  //   let SubTotalTransporte = alculoSubTotalInicial * (1 + (maerginTrans + sumaF6F7));

  //   // SUBTOTAL TRANSPORTE
  //   SubTotalTransporte = (Math.ceil(SubTotalTransporte));
  //   console.log(SubTotalTransporte)







  //   // ======== CALCULO FEE ITERATIVO TRANSPORTE 
  //   let F36 = SubTotalTransporte;
  //   F6 = marginProfit / 100;
  //   F7 = MargenPorFinanciacion;
  //   F8 = feeMarcaCliente / 100;

  //   let primerCalculoTransporte = F36 * (1 + F6 + F7) * F8;
  //   let segundoCalculoTransporte = primerCalculoTransporte * F8;
  //   let tercerCalculoTransporte = segundoCalculoTransporte * F8;
  //   let cuartoCalculoTransporte = tercerCalculoTransporte * F8;

  //   let resultadoTransporte = primerCalculoTransporte + segundoCalculoTransporte + tercerCalculoTransporte + cuartoCalculoTransporte;
  //   let FeeTransporteTotalCalculado = resultadoTransporte;
  //   FeeTransporteTotalCalculado = Math.round(FeeTransporteTotalCalculado);
  //   console.log(FeeTransporteTotalCalculado)
  //   // ======== FIN CALCULO FEE ITERATIVO TRANSPORTE



  //   // TOTAL PRECIO TRANSPORTE DE ENTREGA
  //   const TotalPrecioTransporteDeEntrega = SubTotalTransporte + FeeTransporteTotalCalculado;
  //   console.log(TotalPrecioTransporteDeEntrega)


  //   //* CALCULAR EL IVA DEL TRANSPORTE
  //   let IvaSubTotalTransporte: number = (19 / 100) * SubTotalTransporte;
  //   IvaSubTotalTransporte = Math.round(IvaSubTotalTransporte);
  //   console.log(IvaSubTotalTransporte)


  //   // TOTAL PRECIO TRANSPORTE DE ENTREGA
  //   let transporteConIva = TotalPrecioTransporteDeEntrega + IvaSubTotalTransporte;
  //   console.log(transporteConIva)


  //   // SUMA CONTONIA DEL TRANSPORTE TOTAL
  //   ValorTotalDeTransporteGeneral += (transporteConIva)

  //   console.log(ValorTotalDeTransporteGeneral)
  //   updatedQuoteDetail.transportTotalPrice = ValorTotalDeTransporteGeneral;




  //   // =========================== CALCULO FEE MARCACION

  //   // MARGEN SERVICIO DE MARCACIÓN (PARAMETRIZACIÓN)
  //   const marginForDialingServices: number = systemConfig.marginForDialingServices || 0;

  //   console.log(SubTotalCostoMarcacion)
  //   console.log(CuatroPorMilMarcacion)
  //   console.log(marginForDialingServices)
  //   console.log(marginCli)
  //   console.log(marginFian)
  //   console.log(sumaF6F7)

  //   let marginFDS = marginForDialingServices / 100;
  //   // Convertir porcentajes a valores decimales
  //   let F40 = (SubTotalCostoMarcacion);

  //   // Evaluar la fórmula
  //   let SubTotalSinFeeMarcacion = (SubTotalCostoMarcacion + CuatroPorMilMarcacion) * (1 + (marginFDS + sumaF6F7));
  //   console.log(SubTotalSinFeeMarcacion)





  //   // ======== CALCULO FEE ITERATIVO MARCACION
  //   let F41 = SubTotalSinFeeMarcacion;
  //   F6 = marginProfit / 100;
  //   F7 = MargenPorFinanciacion;
  //   F8 = feeMarcaCliente / 100;

  //   let primerCalculoMarcacion = F41 * (1 + F6 + F7) * F8;
  //   let segundoCalculoMarcacion = primerCalculoMarcacion * F8;
  //   let tercerCalculoMarcacion = segundoCalculoMarcacion * F8;
  //   let cuartoCalculoMarcacion = tercerCalculoMarcacion * F8;

  //   let resultadoMarcacion = primerCalculoMarcacion + segundoCalculoMarcacion + tercerCalculoMarcacion + cuartoCalculoMarcacion;
  //   let FeeMarcacionTotalCalculado = resultadoMarcacion;
  //   FeeMarcacionTotalCalculado = Math.round(FeeMarcacionTotalCalculado);
  //   console.log(FeeMarcacionTotalCalculado)
  //   // ======== FIN CALCULO FEE ITERATIVO MARCACION




  //   // TOTAL PRECIO MARCACION DE ENTREGA
  //   const TotalPrecioMarcacionDeEntrega = SubTotalSinFeeMarcacion + FeeMarcacionTotalCalculado;
  //   console.log(TotalPrecioMarcacionDeEntrega);

  //   // //* IVA FEE MARCACION
  //   // const IvaFeeMarcacion: number = (19 / 100) * SubTotalConFeeMarcacion || 0;

  //   // // TOTAL PRECIO MARCACION CON IVA
  //   // const TotalPrecioMarcacionDeEntrega = SubTotalConFeeMarcacion + IvaFeeMarcacion;
  //   // console.log(TotalPrecioMarcacionDeEntrega);





  //   // SUB TOTAL TODOS LOS FEE
  //   console.log(SubTotalFeeMuestra)
  //   console.log(TotalPrecioTransporteDeEntrega)
  //   console.log(TotalPrecioMarcacionDeEntrega)
  //   let SubTotalFees = SubTotalFeeMuestra + TotalPrecioTransporteDeEntrega + TotalPrecioMarcacionDeEntrega;
  //   SubTotalFees = Math.round(SubTotalFees);
  //   console.log(SubTotalFees);


  //   // IVAS TODOS LOS FEE
  //   let IvasTotalFees = (19 / 100) * SubTotalFees || 0;
  //   IvasTotalFees = Math.round(IvasTotalFees);
  //   console.log(IvasTotalFees);


  //   // TOTAL INGRESOS DE ADICIONALES
  //   let TotalIngresosAdicionales = SubTotalFees + IvasTotalFees;
  //   TotalIngresosAdicionales = Math.round(TotalIngresosAdicionales);
  //   console.log(TotalIngresosAdicionales);






  //   // TERCERA PARTE DEL CALCULO RENTABILIDAD FINAL ================================================================>


  //   // TOTAL INGRESOS ANTES DE IVA
  //   const TotalIngresosAntesDeIva = updateQuoteDetailDto?.unitPrice + SubTotalFees;
  //   console.log(updateQuoteDetailDto?.unitPrice)
  //   console.log(SubTotalFees)
  //   console.log(TotalIngresosAntesDeIva)


  //   console.log(DiasPagoClienteCorporativo)
  //   // Dias de pago del cliente 

  //   const C23 = updateQuoteDetailDto.totalCostoProduccion;
  //   // const C23 = 353593; // Ttoal costo producción
  //   const C16 = systemConfig.supplierFinancingPercentage / 100; // 20% Financiacion cliente
  //   // const C16 = marginProfit / 100; // 20% Financiacion cliente
  //   const F62 = DiasPagoClienteCorporativo; // Dias de pago
  //   const C49 = TotalGastosAdicionales; // Gastos adicionales


  //   console.log(C23)
  //   console.log(marginProfit)
  //   console.log(DiasPagoClienteCorporativo)
  //   console.log(TotalGastosAdicionales)

  //   let resultadoCostoFnanciarion = (C23 * (C16 / 30) * (F62 + 15)) + (C49 * (C16 / 30) * (F62 + 15));
  //   resultadoCostoFnanciarion = Math.round(resultadoCostoFnanciarion);
  //   console.log(resultadoCostoFnanciarion)

  //   // hasta aqui todo bien




  //   // FEE REGISTRADO EN EL CARRITO == FEE SELECCIONADO AL INICIAR SESION
  //   const Fee = feeMarcaCliente || 0;
  //   const ResultFee = TotalIngresosAntesDeIva * Fee / 100;
  //   console.log(Fee)



  //   // TOTAL GASTOS ANTES DE IVA === VARIABEL GOBAL 
  //   const TotalGastoAntesDeIva = SubTotal + updateQuoteDetailDto.totalCostoProduccionSinIva + resultadoCostoFnanciarion + ResultFee;
  //   console.log(TotalGastoAntesDeIva)


  //   // UTILIDAD DE VENTAS == VARIABLE GLOBAL 
  //   const UtilidadDeVentas = TotalIngresosAntesDeIva - TotalGastoAntesDeIva;
  //   console.log(UtilidadDeVentas)


  //   // % UTILIDAD DE VENTAS ROI == VARIABLE GLOBAL 
  //   const UtilidadDeVentasROI = (UtilidadDeVentas / TotalGastoAntesDeIva) * 100;
  //   const ProcentajeUtilidadDeVentasROI = parseFloat(UtilidadDeVentasROI.toFixed(2));

  //   console.log(ProcentajeUtilidadDeVentasROI)

  //   // RETENCIONES === VARIABLE GLOBAL 
  //   let ValueRetenciones = systemConfig.withholdingAtSource / 100;
  //   console.log(ValueRetenciones)
  //   console.log(TotalIngresosAntesDeIva)
  //   let Retenciones = (TotalIngresosAntesDeIva * ValueRetenciones);
  //   Retenciones = Math.round(Retenciones);
  //   console.log(Retenciones)

  //   updatedQuoteDetail.withholdingAtSourceValue = Retenciones;






  //   // UTILIDAD COMERCIALES

  //   //UTILIDAD - LIQUIDEZ FINAL
  //   console.log(TotalIngresosAntesDeIva)
  //   console.log(TotalGastoAntesDeIva)
  //   console.log(Retenciones)
  //   const UtilidadLiquidezFinal = TotalIngresosAntesDeIva - TotalGastoAntesDeIva - Retenciones
  //   console.log(UtilidadLiquidezFinal);


  //   // % UTILIDAD ROI - LIQUIDEZ FINAL
  //   let PorcentajeUtilidadRoi_LiquidezFinal = (UtilidadLiquidezFinal / TotalGastoAntesDeIva) * 100;
  //   PorcentajeUtilidadRoi_LiquidezFinal = Math.round(PorcentajeUtilidadRoi_LiquidezFinal * 100) / 100;
  //   console.log(PorcentajeUtilidadRoi_LiquidezFinal);



  //   // RATIO UTILIDAD MENSUAL
  //   let RatiosUtilidadMensual = (PorcentajeUtilidadRoi_LiquidezFinal / DiasPagoClienteCorporativo) * 30;
  //   // RatiosUtilidadMensual = Math.round(RatiosUtilidadMensual * 100 ) / 100;
  //   console.log(RatiosUtilidadMensual);




  //   // RENTABILIDAD MINIMA ESPERADA

  //   let F622 = DiasPagoClienteCorporativo;
  //   let C566 = 0.04; // 4.0% en formato decimal
  //   let C54 = 0.08; // 8.0% en formato decimal

  //   // Comprueba si F622 es mayor que 30
  //   let RentabiliadMinima =
  //     F622 > 30 ? (C566 / 30) * F622 : (C54 / 30) * F622;

  //   // Formatea el resultado como porcentaje
  //   let RentabiliadMinimaEsperada = parseFloat((RentabiliadMinima * 100).toFixed(2));
  //   console.log(RentabiliadMinimaEsperada);
  //   updatedQuoteDetail.profitability = RentabiliadMinimaEsperada;

  //   console.log()

  //   // DESCUENTO SUGERIDO AL COMERCIAL
  //   const F72 = UtilidadLiquidezFinal;
  //   const C60 = TotalGastoAntesDeIva;
  //   const F69 = Retenciones;
  //   const F76 = RentabiliadMinimaEsperada / 100; // Convertir el porcentaje a decimal (4%)
  //   const F60 = TotalIngresosAntesDeIva;

  //   console.log(UtilidadLiquidezFinal)
  //   console.log(TotalGastoAntesDeIva)
  //   console.log(Retenciones)
  //   console.log(RentabiliadMinimaEsperada)
  //   console.log(TotalIngresosAntesDeIva)

  //   const resultadoDescuentoSgerido = ((F72 - ((C60 + F69) * F76)) / F60) * 100; // Calculamos el resultado en porcentaje
  //   console.log(resultadoDescuentoSgerido);


  //   //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
  //   updatedQuoteDetail.maximumDiscount = resultadoDescuentoSgerido;
  //   console.log(resultadoDescuentoSgerido)



  //   // VALORES FINALES DE VENTA ========================

  //   // SUBTOTAL CON DESCUENTO
  //   const SubTotalFinalesDeIva = TotalIngresosAntesDeIva;
  //   console.log(SubTotalFinalesDeIva);

  //   updatedQuoteDetail.subTotal = SubTotalFinalesDeIva;
  //   updatedQuoteDetail.totalAdditionalDiscount = 0;
  //   updatedQuoteDetail.subTotalWithDiscount = updatedQuoteDetail.subTotal || 0;
  //   updatedQuoteDetail.totalCost = SubTotalFinalesDeIva; // Subtotal con descuento
  //   updatedQuoteDetail.totalValueWithoutIva = updatedQuoteDetail.subTotal || 0;


  //   let IvaSnTotalFinal: number = (19 / 100) * SubTotalFinalesDeIva;
  //   IvaSnTotalFinal = Math.round(IvaSnTotalFinal);
  //   console.log(IvaSnTotalFinal);


  //   updatedQuoteDetail.iva = IvaSnTotalFinal;


  //   let TotalVenta: number = SubTotalFinalesDeIva + IvaSnTotalFinal;
  //   TotalVenta = Math.round(TotalVenta);
  //   console.log(TotalVenta);
  //   updatedQuoteDetail.totalValue = TotalVenta;




  //   // UTILIDADES FINALES


  //   // UTILIDAD FINAL CON DESCUENTO
  //   let UtilidadFinalConDescuento = SubTotalFinalesDeIva - TotalGastoAntesDeIva - Retenciones
  //   UtilidadFinalConDescuento = Math.round(UtilidadFinalConDescuento);

  //   console.log(UtilidadFinalConDescuento)

  //   updatedQuoteDetail.businessUtility = UtilidadFinalConDescuento;

  //   // % UTILIDAD FINAL CON DESCUENTO
  //   let PorcentajeUtilidadFinalConDescuento = (UtilidadFinalConDescuento / (TotalGastoAntesDeIva + Retenciones)) * 100;
  //   // PorcentajeUtilidadFinalConDescuento = Math.round(PorcentajeUtilidadFinalConDescuento);

  //   console.log(PorcentajeUtilidadFinalConDescuento)


  //   //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
  //   // let additionalDisccount: number = updatedQuoteDetail.additionalDiscount > 0 ? totalPrice * (1 - updatedQuoteDetail.additionalDiscount) : 0;
  //   // totalPrice -= additionalDisccount;


  //   //* PRECIO TOTAL ANTES DE IVA (YA HECHO)




  //   updatedQuoteDetail.totalGasto = TotalGastoAntesDeIva;
  //   updatedQuoteDetail.totalIngresos = TotalIngresosAntesDeIva;
  //   updatedQuoteDetail.rentabilidadMininaEsperada = RentabiliadMinimaEsperada;
  //   updatedQuoteDetail.descuentoSugerido = resultadoDescuentoSgerido;
  //   updatedQuoteDetail.UtilidadFinal = UtilidadFinalConDescuento;
  //   updatedQuoteDetail.porcentajeUtilidadFinal = PorcentajeUtilidadFinalConDescuento;




  //   cartQuoteDb.ivaTotal += IvaSnTotalFinal;
  //   cartQuoteDb.subTotal += SubTotalFinalesDeIva;



  //   //* IVA DE LA VENTA
  //   // const iva: number = (product.iva / 100) * totalPrice || 0;
  //   // totalPrice += iva;
  //   // totalCost += iva;

  //   //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
  //   // Math.round(updatedQuoteDetail.totalValue);

  //   //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE
  //   // const withholdingAtSource: number = systemConfig.withholdingAtSource || 0;
  //   // const withholdingAtSourceValue: number = (totalPrice * withholdingAtSource / 100) || 0;

  //   // totalPrice += withholdingAtSourceValue;
  //   // totalCost += withholdingAtSourceValue;
  //   // cartQuoteDb.withholdingAtSourceValue = withholdingAtSourceValue;

  //   //* CALCULAR UTILIDAD DEL NEGOCIO
  //   // const businessUtility = (totalPrice - (totalCost - withholdingAtSourceValue)) || 0;
  //   // updatedQuoteDetail.businessUtility = businessUtility;

  //   //* CALCULAR RENTABILIDAD DEL NEGOCIO
  //   // const profitability: number = (businessUtility / totalPrice) || 0;
  //   // updatedQuoteDetail.profitability = profitability;

  //   //* CALCULAR DESCUENTO
  //   // const discount: number = (product.promoDisccount / 100) * totalPrice || 0;

  //   updatedQuoteDetail.discountPercentage = 0; // reutilizar

  //   updatedQuoteDetail.discount = product.promoDisccount;
  //   // totalPrice -= discount;

  //   //* CALCULAR SUBTOTAL CON DESCUENTO

  //   //* CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
  //   const businessMarginProfit: number = (totalPrice - updatedQuoteDetail.totalValueWithoutIva);
  //   updatedQuoteDetail.businessMarginProfit = businessMarginProfit;
  //   cartQuoteDb.totalPrice += TotalVenta;

  //   console.log(cartQuoteDb.totalPrice)

  //   // //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
  //   // updatedQuoteDetail.maximumDiscount = 20;

  //   console.log(updatedQuoteDetail.transportTotalPrice)

  //   Object.assign(quoteDetail, updatedQuoteDetail);

  //   let updatedCartQuote: CartQuote = cartQuoteDb;

  //   if (saveData == 1) {
  //     updatedCartQuote = await this.cartQuoteRepository.save(cartQuoteDb);
  //     await this.quoteDetailRepository.save(quoteDetail);
  //   }

  //   return {
  //     updatedQuoteDetail,
  //     cartQuoteDb
  //   };
  // };



























  async updateUpDiscountAditional(id: string, updateQuoteDetailDto: DiscountQuoteDetailDto, save: number, user: User,) {
    let saveData: number = 0;

    if (save) {
      saveData = save;
    };

    console.log(updateQuoteDetailDto)

    const quoteDetail: QuoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'cartQuote',
        'cartQuote.client',
        'cartQuote.client.user',
        'cartQuote.client.user.company',
        'cartQuote.client.user.brands',
        'product.packings',
        'product.refProduct',
        'product.refProduct.images',
        'product.refProduct.packings',
        'product.refProduct.supplier',
        'product.refProduct.supplier.disccounts',
        'product.refProduct.supplier.disccounts.disccounts',
        'markingServices',
        'markingServices.marking',
        'markingServices.markingServiceProperty',
        'markingServices.markingServiceProperty.markedServicePrices',
      ],
    });

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, quoteDetail);

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: quoteDetail.cartQuote.id,
      }
    });

    const product: Product = quoteDetail.product;
    const cartQuote: CartQuote = quoteDetail.cartQuote;

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${quoteDetail.cartQuote.id} not found`);

    cartQuoteDb.productsQuantity += quoteDetail.quantities || 0;

    console.log(cartQuoteDb.totalPrice)
    cartQuoteDb.totalPrice -= quoteDetail.totalValue
    cartQuoteDb.totalPrice += updatedQuoteDetail.total || 0;
    cartQuoteDb.productsQuantity += updatedQuoteDetail.quantities || 0;

    console.log(cartQuoteDb.totalPrice)

    //* ------------- CALCULOS ------------- *//

    const SubTotalActual = quoteDetail.subTotalWithDiscount;
    const ingresosTotales = quoteDetail.totalIngresos;
    const gastosTotales = quoteDetail.totalGasto;
    const IvaActual = quoteDetail.iva;
    const TotalActual = quoteDetail.totalValue;
    const utilidadFinalActual = quoteDetail.UtilidadFinal;
    const porcentajeUtilidadFinalActual = quoteDetail.porcentajeUtilidadFinal;
    const descuentoAdicional = updateQuoteDetailDto.discount / 100;
    const retencion = quoteDetail.withholdingAtSourceValue;

    console.log(SubTotalActual)
    console.log(ingresosTotales)
    console.log(gastosTotales)
    console.log(IvaActual)
    console.log(TotalActual)
    console.log(utilidadFinalActual)
    console.log(porcentajeUtilidadFinalActual)
    console.log(retencion)

    console.log(updateQuoteDetailDto.discount)

    const newAppliDiscount = Math.round(ingresosTotales * descuentoAdicional);

    const newSubTotal = Math.round(SubTotalActual - newAppliDiscount);
    const newIva = Math.round(newSubTotal * 19 / 100);
    const newTotal = Math.round(newSubTotal + newIva);
    const newUtilidadFinal = Math.round(newSubTotal - gastosTotales - retencion);
    const newPorcentajeUtilidadFinal = (newUtilidadFinal / (gastosTotales + retencion)) * 100;


    console.log(newSubTotal)
    console.log(newAppliDiscount)
    console.log(newIva)
    console.log(newTotal)
    console.log(newUtilidadFinal)
    console.log(newPorcentajeUtilidadFinal)


    updatedQuoteDetail.subTotalWithDiscount = newSubTotal;
    updatedQuoteDetail.iva = newIva
    updatedQuoteDetail.totalValue = newTotal
    updatedQuoteDetail.UtilidadFinal = newUtilidadFinal;
    updatedQuoteDetail.porcentajeUtilidadFinal = newPorcentajeUtilidadFinal
    updatedQuoteDetail.additionalDiscount = updateQuoteDetailDto.discount;
    updatedQuoteDetail.totalAdditionalDiscount = newAppliDiscount;


    cartQuoteDb.ivaTotal += newIva;
    cartQuoteDb.subTotal += newSubTotal;


    cartQuoteDb.totalPrice += newTotal;

    console.log(cartQuoteDb.totalPrice)



    Object.assign(quoteDetail, updatedQuoteDetail);

    let updatedCartQuote: CartQuote = cartQuoteDb;

    if (saveData == 1) {
      updatedCartQuote = await this.cartQuoteRepository.save(cartQuoteDb);
      await this.quoteDetailRepository.save(quoteDetail);
    }

    return {
      updatedQuoteDetail,
      cartQuoteDb
    };
  };





  async updateUp(id: string, updateQuoteDetailDto: CreateQuoteDetailDto, save: number, user: User,) {
    let saveData: number = 0;

    if (save) {
      saveData = save;
    };

    console.log(updateQuoteDetailDto)

    const hasSample: boolean = updateQuoteDetailDto.hasSample;

    console.log(hasSample)

    const quoteDetail: QuoteDetail = await this.quoteDetailRepository.findOne({
      where: {
        id,
      },
      relations: [
        'cartQuote',
        'cartQuote.client',
        'cartQuote.client.user',
        'cartQuote.client.user.company',
        'cartQuote.client.user.brands',
        'product.packings',
        'product.refProduct',
        'product.refProduct.images',
        'product.refProduct.packings',
        'product.refProduct.supplier',
        'product.refProduct.supplier.disccounts',
        'product.refProduct.supplier.disccounts.disccounts',
        'markingServices',
        'markingServices.logos',
        'markingServices.externalSubTechnique',
        'markingServices.marking',
        'markingServices.markingServiceProperty',
        'markingServices.markingServiceProperty.markedServicePrices',
      ],
    });


    console.log(quoteDetail)
    console.log(quoteDetail.totalValue)

    if (!quoteDetail)
      throw new NotFoundException(`Quote detail with id ${id} not found`);

    const updatedQuoteDetail = plainToClass(QuoteDetail, quoteDetail);

    console.log(updatedQuoteDetail)

    if (updateQuoteDetailDto.quantities) {
      updatedQuoteDetail.quantities = updateQuoteDetailDto.quantities;
    };

    if (updateQuoteDetailDto.discount) {
      updatedQuoteDetail.discount = updateQuoteDetailDto.discount;
      updatedQuoteDetail.discountPercentage = updateQuoteDetailDto.discount;
    };

    const cartQuoteDb: CartQuote = await this.cartQuoteRepository.findOne({
      where: {
        id: quoteDetail.cartQuote.id,
      },
      relations: [
        'client',
        'client.user',
        'client.user.company',
        'client.user.brands',
      ],
    });

    // const product: Product = quoteDetail.product; 
    const productId = typeof quoteDetail.product === 'string' ? quoteDetail.product : quoteDetail.product.id;


    // Obtendi la información del Producto
    const product: Product = await this.productRepository.findOne({
      where: {
        id: updateQuoteDetailDto.product,
      },
      relations: [
        'packings',
        'refProduct',
        'refProduct.packings',
        'refProduct.supplier',
        'refProduct.supplier.disccounts',
        'refProduct.supplier.disccounts.disccounts',
      ],
    });

    if (!product)
      throw new NotFoundException(`Product with id ${quoteDetail.product} not found`);


    console.log(product)

    const cartQuote: CartQuote = quoteDetail.cartQuote;

    if (!cartQuoteDb)
      throw new NotFoundException(`Cart quote with id ${quoteDetail.cartQuote.id} not found`);

    cartQuoteDb.productsQuantity += quoteDetail.quantities || 0;

    console.log(cartQuoteDb.totalPrice)
    cartQuoteDb.totalPrice -= quoteDetail.totalValue
    cartQuoteDb.totalPrice += updatedQuoteDetail.total || 0;
    cartQuoteDb.productsQuantity += updatedQuoteDetail.quantities || 0;

    console.log(cartQuoteDb.totalPrice)


    //* ------------- CALCULOS ------------- *//
    const quantity: number = updateQuoteDetailDto.quantities || 0;
    let totalPrice: number = updateQuoteDetailDto.unitPrice || 0;
    let totalTransportPrice: number = 0;
    let totalCost: number = 0;
    let productVolume: number = 0;
    let totalVolume: number = 0;


    console.log(quantity)
    console.log(totalPrice)

    // DATOS A FUTURO PARA CALCULAR TRANSPORTES

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL MARCADO
    const markingTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: 'bogota' })
      .getMany();

    //* OBTENER LOS PRECIOS DE TRANSPORTE DEL PROVEEDOR AL CLIENTE
    const clientTransportPrices: LocalTransportPrice[] = await this.localTransportPriceRepository
      .createQueryBuilder('localTransportPrice')
      .where('LOWER(localTransportPrice.origin) =:origin', { origin: 'bogota' })
      .andWhere('LOWER(localTransportPrice.destination) =:destination', { destination: cartQuote.destinationCity.toLowerCase().trim() })
      .getMany();

    //TODO: UTILIZAR LA API DE FEDEX
    //TODO: UTILIZAR LA API DE FEDEX

    //* OBTENER LA CONFIGURACIÓN DEL SISTEMA
    const systemConfigDb: SystemConfig[] = await this.systemConfigRepository.find();
    const systemConfig: SystemConfig = systemConfigDb[0];


    // CODIGO POSTAL DEL CLIENTE
    let condigoPostalCliente = cartQuoteDb?.client?.user?.company?.postalCode;
    console.log(condigoPostalCliente)



    // INFORMACIÓN DE FEDEX TOKEN 
    let tokenFedeex;
    try {
      tokenFedeex = await this.obtenerTokenFedex();
      console.log(tokenFedeex);
      // Ahora puedes hacer lo que necesites con el token, por ejemplo, hacer una solicitud utilizando el token.
    } catch (error) {
      // Maneja el error si ocurre alguno al obtener el token
      console.error('Error al usar el token de FedEx:', error);
    }


    //* CALCULAR EL VOLUMEN DEL PRODUCTO
    productVolume = (product?.height * product?.weight * product?.large) || 0;

    //* DATOS DEL CLIENTE
    const cartQuoteClient: Client = cartQuote?.client;
    const clientUser: User = cartQuote?.client?.user;
    let clientType: string = '';

    //* PRECIO ESCOGIDO EN EL DETALLE DEL PRODUCTO ANTES DEL CARRITO
    const burnQuantity: number = updatedQuoteDetail?.unitPrice || 0;
    totalCost += burnQuantity;

    console.log(product)
    //* VERIFICAR SI EL PRODUCTO TIENE EMPAQUE
    const packing: Packing = product.packings.length > 0 ? product.packings[0] : product?.refProduct?.packings[0] || undefined;
    const packingUnities: number = product.packings.length > 0 ? product?.packings[0]?.unities : product?.refProduct?.packings[0]?.unities || 0;

    //* CALCULAR EL VOLUMEN DEL EMPAQUE DEL PRODUCTO
    let boxesQuantity: number = (quantity / packingUnities) || 0;

    boxesQuantity = Math.round(boxesQuantity) + 1 || 0;

    //* CALCULAR EL VOLUMEN DEL PAQUETE
    const packingVolume: number = (packing?.height * packing?.width * packing?.large) || 0;
    totalVolume = (packingVolume * boxesQuantity) || 0;

    console.log(packing)




    //* SE SOLICITA MUESTRA
    let ValorMuestraIndividual = 0;
    let TotalMuestra = 0;
    let TransporteMuestra = 0;
    let TotalGastoMuestra = 0;
    let CuatroPorMilMuestra = 0;
    let CostoTotalMuestra = 0
    let IvaMuestra = 0;
    let ValorTotalDeTransporteGeneral = 0;

    if (hasSample) {

      //* CALCULAR EL PRECIO DE LA MUESTRA

      updatedQuoteDetail.hasSample = true;
      const productHasFreeSample: boolean = product?.freeSample == 1 ? true : false;
      updatedQuoteDetail.sampleValue = 0;

      if (!productHasFreeSample) {
        const samplePrice: number = product?.samplePrice || 0;
        ValorMuestraIndividual = samplePrice;
        if (samplePrice <= 0) {
          const referencePrice: number = product?.referencePrice || 0;
          totalPrice += referencePrice;
          ValorMuestraIndividual = referencePrice;
        };
        console.log(ValorMuestraIndividual)



        // IVA A LA MUESTRA

        if (product.iva > 0 || product.iva != undefined) {
          IvaMuestra = (product.iva / 100) * ValorMuestraIndividual;
          totalPrice += IvaMuestra;
          // console.log(totalPrice)
        };

        if (product.iva == 0) {
          IvaMuestra = (19 / 100) * ValorMuestraIndividual;
          totalPrice += IvaMuestra;
          // console.log(totalPrice)
        }
        console.log(IvaMuestra)


        // TOTAL MUESTRA === VARIABLE GLOBAL
        TotalMuestra = ValorMuestraIndividual + IvaMuestra;
        console.log(TotalMuestra)


        // Transporte de la Muestra
        // if (updatedQuoteDetail?.cartQuote?.destinationCity?.toLowerCase() == 'bogota') {
        //   const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
        //     ? markingTransportPrices.sort((a, b) => {
        //       const diffA = Math.abs(a.volume - totalVolume);
        //       const diffB = Math.abs(b.volume - totalVolume);
        //       return diffA - diffB;
        //     })[0]
        //     : undefined;

        //   const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

        //   totalPrice += clientTransportPrice;

        //   // updatedQuoteDetail.transportTotalPrice = 0;
        //   // updatedQuoteDetail.transportTotalPrice += clientTransportPrice || 0;
        //   // updatedQuoteDetail.sampleValue += clientTransportPrice || 0;

        //   TransporteMuestra = clientTransportPrice;

        // } else {
        //TODO: FEDEX
        let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);

        if (typeof dataPrecio === 'number') {
          // COSTO TRANSPORTE DE ENTREGA
          TransporteMuestra = dataPrecio;
        } else {
          console.error('Error: dataPrecio no es de tipo numérico.');
        }
        console.log(TransporteMuestra);
        // updatedQuoteDetail.transportTotalPrice += TransporteMuestra;
        // }

        // SUMA CONTONIA DEL TRANSPORTE TOTAL
        // ValorTotalDeTransporteGeneral += TransporteMuestra,
        updatedQuoteDetail.sampleTransportValue = TransporteMuestra;

        // TOTAL GASTOS MUESTRA === VARIABLE GLOBAL
        TotalGastoMuestra = TotalMuestra + TransporteMuestra;


        // CUATRO POR MIL MUESTRA 
        CuatroPorMilMuestra = TotalGastoMuestra * 0.004 || 0;
        updatedQuoteDetail.transportServices4x1000 = CuatroPorMilMuestra;
        console.log(CuatroPorMilMuestra)


        // COSTO TOTAL MUESTRA === VARIABLE GLOBAL
        CostoTotalMuestra = TotalGastoMuestra + CuatroPorMilMuestra;
        console.log(CostoTotalMuestra)

        // totalPrice += samplePrice;
        updatedQuoteDetail.sampleValue = CostoTotalMuestra;
        // updatedQuoteDetail.sampleValue = referencePrice;

      };
    } else {
      updatedQuoteDetail.hasSample = false;
    };











    // CALCULOS DEL TRANSPORTE


    // updatedQuoteDetail.transportTotalPrice = 0;


    // aqui se quito

    //* CALCULA EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL MARCADO
    const markingClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: markingOrigin, destination: markingDestination, price: markingTransportPrice, volume: markingTransportVolume } = markingClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };

    //* CALCULAR EL COSTO DE TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL CLIENTE
    const clientClosestTransport: LocalTransportPrice | undefined = markingTransportPrices.length > 0
      ? markingTransportPrices.sort((a, b) => {
        const diffA = Math.abs(a.volume - totalVolume);
        const diffB = Math.abs(b.volume - totalVolume);
        return diffA - diffB;
      })[0]
      : undefined;

    const { origin: clientOrigin, destination: clientDestination, price: clientTransportPrice, volume: clientTransportVolume } = clientClosestTransport || { origin: '', destination: '', price: 0, volume: 0 };


    // Calcular precio transporte al cliente
    let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);
    console.log((typeof dataPrecio))

    let CuatroPorMilTransporte = 0;
    let CostoTransporteDeEntrega;

    if (typeof dataPrecio === 'number') {

      // COSTO TRANSPORTE DE ENTREGA
      CostoTransporteDeEntrega = dataPrecio;

      CuatroPorMilTransporte = dataPrecio * 0.004 || 0;
    } else {
      console.error('Error: dataPrecio no es de tipo numérico.');
    }


    // COSTO TOTAL TRANSPORTE DE ENTREGA
    const CostoTotalTransporteDeEntrega = CostoTransporteDeEntrega + CuatroPorMilTransporte;
    console.log(CostoTotalTransporteDeEntrega)



    // INICIO CALCULO DE SERVICIO DE MARCACIÓN
    let ValorTotalMarcacion = 0;
    let valorTransporteMarcacion = 0;
    let valorTransporteMarcacionx = 0;

    console.log(updatedQuoteDetail)

    const markingServices: MarkingService[] = updatedQuoteDetail?.markingServices || [];
    console.log(markingServices)


    //* Buscamos los datos de la referencia
    const quoteDetailRefProduct: RefProduct = product.refProduct;
    console.log(quoteDetailRefProduct);
    let marking: Marking;

    // Preguntamos si es personalizable ?
    if (quoteDetailRefProduct?.personalizableMarking == 1) {

      if (markingServices || markingServices.length > 0) {
        console.log(markingServices)
        for (const markingService of markingServices) {
          let markingServicePropertyPrice: number = 0;

          const markingServiceProperty: MarkingServiceProperty = markingService?.markingServiceProperty;
          console.log(markingServiceProperty)
          for (const markedServicePrice of markingServiceProperty.markedServicePrices) {
            //* VERIFICAR QUE LA CANTIDAD SE ENCUENTRE ENTRE EL RANGO DEL PRECIO SERVICIO MARCADO
            console.log(quantity)
            // if (markedServicePrice.minRange >= quantity && markedServicePrice.maxRange > quantity) {
            if (quantity >= markedServicePrice.minRange && quantity <= markedServicePrice.maxRange) {

              console.log(markedServicePrice.unitPrice)

              let totalMarking: number = (quantity * markedServicePrice.unitPrice);

              // marking = markingServiceProperty?.externalSubTechnique?.marking;
              marking = markingService?.marking;
              console.log(totalMarking)

              //* SI EL SERVICIO DE MARCADO TIENE IVA
              if (marking.iva > 0) {
                //* CALCULAR EL IVA
                const iva: number = (marking.iva / 100) * totalMarking || 0;
                totalMarking += iva;
                totalCost += iva;
                updatedQuoteDetail.markingPriceWithIva = iva;

                //* CALCULAR EL 4X1000
                let value4x1000: number = totalMarking * 0.004 || 0;
                totalMarking += value4x1000;
                totalCost += value4x1000;
                updatedQuoteDetail.markingPriceWith4x1000 = value4x1000;
              };

              //* ADICIONAR EL % DE MARGEN DE GANANCIA POR SERVICIO 
              const marginForDialingServices: number = (systemConfig.marginForDialingServices / 100) * totalMarking || 0;
              totalMarking += marginForDialingServices;




              //* CALCULAR EL COSTO DEL TRANSPORTE DE LA ENTREGA DEL PRODUCTO AL PROVEEDOR
              // Calcular precio transporte al cliente
              let dataPrecio = await this.calcularPreciosFedex(tokenFedeex, condigoPostalCliente, condigoPostalCliente, boxesQuantity, packing.large, packing.width, packing.height);

              let CuatroPorMilTransporte = 0;
              let TransportPricesMarkingFedex;

              if (typeof dataPrecio === 'number') {

                // COSTO TRANSPORTE DE ENTREGA
                TransportPricesMarkingFedex = dataPrecio;
                CuatroPorMilTransporte = dataPrecio * 0.004 || 0;
              } else {
                console.error('Error: dataPrecio no es de tipo numérico.');
              }


              markingService.markingTransportPrice = TransportPricesMarkingFedex;
              totalMarking += TransportPricesMarkingFedex;
              totalCost += TransportPricesMarkingFedex;

              valorTransporteMarcacion += TransportPricesMarkingFedex;

              //* ADICIONAR EL MARGEN DE GANANCIA POR SERVICIO DE TRANSPORTE
              const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * markingTransportPrice || 0;
              totalMarking += supplierFinancingPercentage;

              markingService.markingTransportPrice = (TransportPricesMarkingFedex + supplierFinancingPercentage) || 0;
              markingService.calculatedMarkingPrice = totalMarking;

              ValorTotalMarcacion += totalMarking;


              valorTransporteMarcacionx = (valorTransporteMarcacion)

              // newQuoteDetail.markingWithProductSupplierTransport = TransportPricesMarkingFedex;
              updatedQuoteDetail.markingWithProductSupplierTransport = TransportPricesMarkingFedex;


              // await this.markingServiceRepository.save(markingService); //descomentar
              // await this.markingServicePropertyRepository.save(markingService);
            };
          };
        };
      };
    };







    // COTO TRANSPORTE MARCACIÓN ==== VARIABLE GLOBAL 
    console.log(valorTransporteMarcacion)


    // COTO TRANSPORTE MARCACIÓN ==== VARIABLE GLOBAL 
    console.log(valorTransporteMarcacionx)


    //SUBTOTAL COSTO MARCACIÓN
    let SubTotalCostoMarcacion = ValorTotalMarcacion || 0;
    SubTotalCostoMarcacion = Math.round(SubTotalCostoMarcacion)
    console.log(SubTotalCostoMarcacion)
    updatedQuoteDetail.markingTotalPrice = ValorTotalMarcacion;


    //* CALCULAR EL IVA

    let IvaMarcacion: number = (19 / 100) * SubTotalCostoMarcacion;
    IvaMarcacion = Math.round(IvaMarcacion)
    console.log(IvaMarcacion)


    // TOTAL COSTO MARCACIÓN

    let TotalCostoMarcacion = SubTotalCostoMarcacion + IvaMarcacion + valorTransporteMarcacion;
    TotalCostoMarcacion = Math.round(TotalCostoMarcacion)
    console.log(TotalCostoMarcacion)


    //* CALCULAR EL 4X1000

    let CuatroPorMilMarcacion: number = TotalCostoMarcacion * 0.004 || 0;
    CuatroPorMilMarcacion = Math.round(CuatroPorMilMarcacion)
    console.log(CuatroPorMilMarcacion)

    //COSTO TOTAL MARCACIÓN

    let CostoTotalMarcacion = TotalCostoMarcacion + CuatroPorMilMarcacion;
    CostoTotalMarcacion = Math.round(CostoTotalMarcacion)
    console.log(CostoTotalMarcacion)


    // SUBTOTAL

    let SubTotal = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra + CostoTotalTransporteDeEntrega + SubTotalCostoMarcacion + CuatroPorMilMarcacion;
    SubTotal = Math.round(SubTotal)
    console.log(SubTotal)

    // IVA SUBTOTAL

    let IvaSubtotal = IvaMuestra + IvaMarcacion;
    IvaSubtotal = Math.round(IvaSubtotal)
    console.log(IvaSubtotal)


    // TOTAL GASTOS DE ADICIONALES

    let TotalGastosAdicionales = CostoTotalMuestra + CostoTotalTransporteDeEntrega + CostoTotalMarcacion;
    TotalGastosAdicionales = Math.round(TotalGastosAdicionales)
    console.log(TotalGastosAdicionales)





console.log()



    // SECCION INGRESOS POR ADICIONALES		=========================================================> 


    // MARGEN DE LA CATEGORIA
    const mainCategoryTag: CategoryTag = await this.categoryTagRepository.findOne({
      where: {
        id: product?.refProduct?.tagCategory,
      },
    });

    //* MARGEN DE GANANCIA DEL PROVEEDOR
    const profitMarginSupplier: number = product?.refProduct?.supplier?.profitMargin || 0;


    // PRECIO DE VENTA SIN IVA (TABLA QUEMADA) === VARIABLE GLOBAL 
    // let PrecioVentaSinIva = 0;
    // if (mainCategoryTag) {
    //   const sumaProcentajes = (1 + (+mainCategoryTag.categoryMargin + profitMargin) / 100)
    //   PrecioVentaSinIva = (SubTotalAntesDeIva * sumaProcentajes) ;

    //   //* REDONDEANDO DECIMALES
    //   PrecioVentaSinIva = Math.round(PrecioVentaSinIva);
    //   console.log(PrecioVentaSinIva)
    // };

    //* CALCULAR Y ADICIONAR MARGEN DE GANANCIA DE TRANSPORTE
    // const supplierFinancingPercentage: number = (systemConfig.supplierFinancingPercentage / 100) * clientTransportPrice || 0;
    // totalTransportPrice += (clientTransportPrice + supplierFinancingPercentage) || 0;

    // updatedQuoteDetail.totalPriceWithTransport = (updatedQuoteDetail.unitPrice + totalTransportPrice) || 0;
    // updatedQuoteDetail.transportTotalPrice += totalTransportPrice || 0;

    // //* CALCULAR EL 4X1000 PARA PAGAR SERVICIOS DE ENTREGA
    // let value4x1000: number = totalPrice * 0.004 || 0;
    // totalPrice += value4x1000;
    // totalCost += value4x1000;
    // updatedQuoteDetail.transportServices4x1000 = value4x1000;




    //* ADICIONAR EL % DE MARGEN DE GANANCIA DE CLIENTE
    let MargenCliente = 0;
    let MargenPorFinanciacion = 0;
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.users', 'companyUsers')
        .andWhere('companyUsers.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUsers.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      totalPrice += mainClient?.margin;
      MargenCliente = mainClient?.margin;
      console.log(MargenCliente)
    } else {
      MargenCliente = 10;
      console.log(MargenCliente)

    };

    totalPrice += cartQuote?.client?.margin || 0;


    // DEFINIR EL TIPO DE CLIENTE QUE ES EL CLIENTE
    if (clientUser) {
      if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 1)
        clientType = 'cliente corporativo secundario';
      else if (clientUser.isCoorporative == 1 && clientUser.mainSecondaryUser == 0)
        clientType = 'cliente corporativo principal';
    };


    // nuevo Yeison
    let financeCostProfist: any = await this.systemFinancingCostProfit.find();
    console.log(financeCostProfist)




    // DIAS DE PAGO DEL CLIENTE CORPOATIV
    let DiasPagoClienteCorporativo = 0;


    //* MARGEN POR FINANCIACIÓN 
    // const MargenPorFinanciacion: number = 0;

    let paymentDays: any[] = [];
    for (const paymentDate of financeCostProfist) {
      let data = {
        day: paymentDate.days,
        percentage: paymentDate.financingPercentage / 100,
      }

      paymentDays.push(data)
    }



    console.log(paymentDays)


    // const paymentDays = [
    //   {
    //     day: 1,
    //     percentage: 0.03,
    //   },
    //   {
    //     day: 15,
    //     percentage: 0.03,
    //   },
    //   {
    //     day: 30,
    //     percentage: 0.03,
    //   },
    //   {
    //     day: 45,
    //     percentage: 0.04,
    //   },
    //   {
    //     day: 60,
    //     percentage: 0.06,
    //   },
    //   {
    //     day: 90,
    //     percentage: 0.09,
    //   },
    // ];



    // Días de pago de Cliente NO Corporativo
    const day60 = paymentDays.find(item => item.day === 1);
    // Si se encuentra el objeto, obtener su porcentaje, de lo contrario, asignar 0
    DiasPagoClienteCorporativo = day60 ? day60.day : 0;
    MargenPorFinanciacion = day60 ? day60.percentage : 0;
    console.log(MargenPorFinanciacion)


    let marginProfit: number = 0;

    marginProfit = systemConfig.noCorporativeClientsMargin;


    //* SI EL CLIENTE ES SECUNDARIO
    if (clientType == 'cliente corporativo secundario') {
      //* BUSCAR EL CLIENTE PRINCIPAL DEL CLIENTE SECUNDARIO
      const mainClient: Client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoinAndSelect('client.user', 'clientUser')
        .leftJoinAndSelect('clientUser.company', 'clientUserCompany')
        .where('clientUserCompany.id =:companyId', { companyId: clientUser.company.id })
        .leftJoinAndSelect('clientUserCompany.user', 'companyUser')
        .andWhere('companyUser.isCoorporative =:isCoorporative', { isCoorporative: 1 })
        .andWhere('companyUser.mainSecondaryUser =:mainSecondaryUser', { mainSecondaryUser: 0 })
        .getOne();

      marginProfit = mainClient.margin || 0;
      const paymentTerms: number = mainClient.paymentTerms || 0;

      //Capturamos los dias fr pago del cliente corporativo.
      DiasPagoClienteCorporativo = paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      // Precio original * (1 - Descuento individual) * (1 - Descuento general)
      MargenPorFinanciacion = percentageDiscount;

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    //* SI EL CLIENTE ES PRINCIPAL
    if (clientType == 'cliente corporativo principal') {
      const margin: number = cartQuoteClient.margin || 0;
      marginProfit = margin;
      const paymentTerms: number = cartQuoteClient.paymentTerms || 0;

      //Capturamos los dias fr pago del cliente corporativo.
      DiasPagoClienteCorporativo = paymentTerms || 0;

      let percentageDiscount: number = 0;

      paymentDays.forEach(paymentDay => {
        if (paymentDay.day == paymentTerms) {
          percentageDiscount = paymentDay.percentage;
        };
      });

      MargenPorFinanciacion = percentageDiscount;

      let value: number = totalPrice * (1 - percentageDiscount);
      totalPrice = Math.round(value);
    };

    console.log(DiasPagoClienteCorporativo)
    console.log(marginProfit)

    let SumaInicial: number = 0;
    SumaInicial = ValorMuestraIndividual + TransporteMuestra + CuatroPorMilMuestra;
    console.log(SumaInicial)


    let sumaSecundaria: number = 0;
    sumaSecundaria = (1 + (+mainCategoryTag.categoryMargin + profitMarginSupplier) / 100)
    console.log(sumaSecundaria)


    let sumaTerciaria: number = 0;
    sumaTerciaria = (1 + (MargenCliente + MargenPorFinanciacion) / 100)
    console.log(sumaTerciaria)


    // SUBTOTAL ==== VARIABLE GLOBAL
    let SubtotalIngresosAdicionales = (SumaInicial * sumaSecundaria) * sumaTerciaria;

    SubtotalIngresosAdicionales = Math.round(SubtotalIngresosAdicionales);
    console.log(SubtotalIngresosAdicionales)



    // MARCA Y/O FEE DEL CLIENTE DEL CARRITO == VARIABLE GLOBAL 
    let feeMarcaCliente = 0;

    if (clientType.toLowerCase() == 'cliente corporativo secundario' || clientType.toLowerCase() == 'cliente corporativo principal') {
      const brandId = cartQuote.brandId;

      if (brandId != '') {
        const cartQuoteBrand: Brand = await this.brandRepository.findOne({
          where: {
            id: brandId,
          },
        });

        if (!cartQuoteBrand)
          throw new NotFoundException(`Brand with id ${brandId} not found`);

        if (cartQuote.client.user.brands.some(brand => brand.id == cartQuoteBrand.id)) {
          const fee: number = (+cartQuoteBrand.fee / 100) * totalPrice || 0;
          feeMarcaCliente = +cartQuoteBrand.fee;
          totalPrice += fee;
          totalCost += fee;
          updatedQuoteDetail.aditionalClientFee = fee;
          cartQuote.fee = fee;
        };
      };
    };








    // =========================== CALCULO FEE MUESTRA


    // ======== CALCULO FEE ITERATIVO MUESTRA
    let calculoMagenes = (1 + (marginProfit + MargenPorFinanciacion) / 100);
    let feeDecimal = 1 + (feeMarcaCliente / 100);

    let valorBase = SubtotalIngresosAdicionales;

    let F29 = SubtotalIngresosAdicionales;
    let F6 = marginProfit / 100;
    let F7 = MargenPorFinanciacion;
    let F8 = feeMarcaCliente / 100;

    let primerCalculo = F29 * (1 + F6 + F7) * F8;
    let segundoCalculo = primerCalculo * F8;
    let tercerCalculo = segundoCalculo * F8;
    let cuartoCalculo = tercerCalculo * F8;

    let resultado = primerCalculo + segundoCalculo + tercerCalculo + cuartoCalculo;
    let FeeMuestraTotalCalculado = resultado;
    FeeMuestraTotalCalculado = Math.round(FeeMuestraTotalCalculado);
    console.log(FeeMuestraTotalCalculado)
    // ======== FIN CALCULO FEE ITERATIVO MUESTRA


    // SUBTOTAL
    let SubTotalFeeMuestra = SubtotalIngresosAdicionales + FeeMuestraTotalCalculado;
    SubTotalFeeMuestra = Math.round(SubTotalFeeMuestra);
    console.log(SubTotalFeeMuestra)


    //* CALCULAR EL IVA yeison
    let IvaSubTotal: number = (19 / 100) * SubTotalFeeMuestra;
    IvaSubTotal = Math.round(IvaSubTotal);
    console.log(IvaSubTotal)


    // TOTAL PRECIO MUESTRA CON IVA
    let TotalPrecioMuestraConIva = SubTotalFeeMuestra + IvaSubTotal;
    TotalPrecioMuestraConIva = Math.round(TotalPrecioMuestraConIva);
    console.log(TotalPrecioMuestraConIva)












    // =========================== CALCULO FEE TRANSPORTE

    // MARGEN DEL TRANSPORTE (PARAMETRIZACION)
    const marginForTransportServices: number = systemConfig.marginForTransportServices || 0;


    console.log(marginForTransportServices)
    // Convertimos los porcentajes a valores decimales
    let maerginTrans = (marginForTransportServices) / 100;
    let marginCli = (marginProfit) / 100;
    let marginFian = (MargenPorFinanciacion);

    console.log(marginCli)
    console.log(marginFian)
    console.log(maerginTrans)
    console.log(CostoTotalTransporteDeEntrega)
    console.log(marginFian)


    let sumaF6F7 = marginCli + marginFian;
    let SubTotalTransporte = CostoTotalTransporteDeEntrega * (1 + (maerginTrans + sumaF6F7));

    // SUBTOTAL TRANSPORTE
    SubTotalTransporte = (Math.ceil(SubTotalTransporte));
    console.log(SubTotalTransporte)







    // ======== CALCULO FEE ITERATIVO TRANSPORTE 
    let F36 = SubTotalTransporte;
    F6 = marginProfit / 100;
    F7 = MargenPorFinanciacion;
    F8 = feeMarcaCliente / 100;

    let primerCalculoTransporte = F36 * (1 + F6 + F7) * F8;
    let segundoCalculoTransporte = primerCalculoTransporte * F8;
    let tercerCalculoTransporte = segundoCalculoTransporte * F8;
    let cuartoCalculoTransporte = tercerCalculoTransporte * F8;

    let resultadoTransporte = primerCalculoTransporte + segundoCalculoTransporte + tercerCalculoTransporte + cuartoCalculoTransporte;
    let FeeTransporteTotalCalculado = resultadoTransporte;
    FeeTransporteTotalCalculado = Math.round(FeeTransporteTotalCalculado);
    console.log(FeeTransporteTotalCalculado)
    // ======== FIN CALCULO FEE ITERATIVO TRANSPORTE



    // TOTAL PRECIO TRANSPORTE DE ENTREGA
    const TotalPrecioTransporteDeEntrega = SubTotalTransporte + FeeTransporteTotalCalculado;
    console.log(TotalPrecioTransporteDeEntrega)
    updatedQuoteDetail.transportTotalPrice = TotalPrecioTransporteDeEntrega;











    // =========================== CALCULO FEE MARCACION

    // MARGEN SERVICIO DE MARCACIÓN (PARAMETRIZACIÓN)
    const marginForDialingServices: number = systemConfig.marginForDialingServices || 0;

    console.log(SubTotalCostoMarcacion)
    console.log(CuatroPorMilMarcacion)
    console.log(marginForDialingServices)
    console.log(marginCli)
    console.log(marginFian)
    console.log(sumaF6F7)

    let marginFDS = marginForDialingServices / 100;
    // Convertir porcentajes a valores decimales
    let F40 = (SubTotalCostoMarcacion);
    let calculoSubTotalInicial = SubTotalCostoMarcacion + CuatroPorMilMarcacion + valorTransporteMarcacionx;

    // Evaluar la fórmula
    let SubTotalSinFeeMarcacion = (calculoSubTotalInicial) * (1 + (marginFDS + sumaF6F7));
    console.log(SubTotalSinFeeMarcacion)





    // ======== CALCULO FEE ITERATIVO MARCACION
    let F41 = SubTotalSinFeeMarcacion;
    F6 = marginProfit / 100;
    F7 = MargenPorFinanciacion;
    F8 = feeMarcaCliente / 100;

    let primerCalculoMarcacion = F41 * (1 + F6 + F7) * F8;
    let segundoCalculoMarcacion = primerCalculoMarcacion * F8;
    let tercerCalculoMarcacion = segundoCalculoMarcacion * F8;
    let cuartoCalculoMarcacion = tercerCalculoMarcacion * F8;
    
    let resultadoMarcacion = primerCalculoMarcacion + segundoCalculoMarcacion + tercerCalculoMarcacion + cuartoCalculoMarcacion;
    let FeeMarcacionTotalCalculado = resultadoMarcacion;
    FeeMarcacionTotalCalculado = Math.round(FeeMarcacionTotalCalculado);
    console.log(FeeMarcacionTotalCalculado)
    // ======== FIN CALCULO FEE ITERATIVO MARCACION




    // TOTAL PRECIO MARCACION DE ENTREGA
    const SubTotalPrecioMarcacionDeEntrega = SubTotalSinFeeMarcacion + FeeMarcacionTotalCalculado;
    console.log(SubTotalPrecioMarcacionDeEntrega);

    //* IVA FEE MARCACION
    const IvaFeeMarcacion: number = (19 * SubTotalSinFeeMarcacion) / 100 || 0;
    console.log(IvaFeeMarcacion)
    
    // TOTAL PRECIO MARCACION CON IVA
    const TotalPrecioMarcacionDeEntrega = SubTotalPrecioMarcacionDeEntrega + IvaFeeMarcacion;
    console.log(TotalPrecioMarcacionDeEntrega);












    // SUB TOTAL TODOS LOS FEE
    console.log(SubTotalFeeMuestra)
    console.log(TotalPrecioTransporteDeEntrega)
    console.log(SubTotalPrecioMarcacionDeEntrega)
    let SubTotalFees = SubTotalFeeMuestra + TotalPrecioTransporteDeEntrega + SubTotalPrecioMarcacionDeEntrega;
    SubTotalFees = Math.round(SubTotalFees);
    console.log(SubTotalFees);


    // IVAS TODOS LOS FEE
    let IvasTotalFees = (19 / 100) * SubTotalFees || 0;
    IvasTotalFees = Math.round(IvasTotalFees);
    console.log(IvasTotalFees);


    // TOTAL INGRESOS DE ADICIONALES
    let TotalIngresosAdicionales = SubTotalFees + IvasTotalFees;
    TotalIngresosAdicionales = Math.round(TotalIngresosAdicionales);
    console.log(TotalIngresosAdicionales);






    // TERCERA PARTE DEL CALCULO RENTABILIDAD FINAL ================================================================>


    // TOTAL INGRESOS ANTES DE IVA
    const TotalIngresosAntesDeIva = updateQuoteDetailDto?.unitPrice + SubTotalFees;
    console.log(updateQuoteDetailDto?.unitPrice)
    console.log(SubTotalFees)
    console.log(TotalIngresosAntesDeIva)


    console.log(DiasPagoClienteCorporativo)
    // Dias de pago del cliente 

    const C23 = updateQuoteDetailDto.totalCostoProduccion;
    // const C23 = 353593; // Ttoal costo producción
    const C16 = systemConfig.supplierFinancingPercentage / 100; // 20% Financiacion cliente
    // const C16 = marginProfit / 100; // 20% Financiacion cliente
    const F62 = DiasPagoClienteCorporativo; // Dias de pago
    const C49 = TotalGastosAdicionales; // Gastos adicionales


    console.log(C23)
    console.log(marginProfit)
    console.log(DiasPagoClienteCorporativo)
    console.log(TotalGastosAdicionales)

    let resultadoCostoFnanciarion = (C23 * (C16 / 30) * (F62 + 15)) + (C49 * (C16 / 30) * (F62 + 15));
    resultadoCostoFnanciarion = Math.round(resultadoCostoFnanciarion);
    console.log(resultadoCostoFnanciarion)

    // hasta aqui todo bien




    // FEE REGISTRADO EN EL CARRITO == FEE SELECCIONADO AL INICIAR SESION
    const Fee = feeMarcaCliente || 0;
    const ResultFee = TotalIngresosAntesDeIva * Fee / 100;
    console.log(Fee)



    // TOTAL GASTOS ANTES DE IVA === VARIABEL GOBAL 
    const TotalGastoAntesDeIva = SubTotal + updateQuoteDetailDto.totalCostoProduccionSinIva + resultadoCostoFnanciarion + ResultFee;
    console.log(TotalGastoAntesDeIva)


    // UTILIDAD DE VENTAS == VARIABLE GLOBAL 
    const UtilidadDeVentas = TotalIngresosAntesDeIva - TotalGastoAntesDeIva;
    console.log(UtilidadDeVentas)


    // % UTILIDAD DE VENTAS ROI == VARIABLE GLOBAL 
    const UtilidadDeVentasROI = (UtilidadDeVentas / TotalGastoAntesDeIva) * 100;
    const ProcentajeUtilidadDeVentasROI = parseFloat(UtilidadDeVentasROI.toFixed(2));

    console.log(ProcentajeUtilidadDeVentasROI)

    // RETENCIONES === VARIABLE GLOBAL 
    let ValueRetenciones = systemConfig.withholdingAtSource / 100;
    console.log(ValueRetenciones)
    console.log(TotalIngresosAntesDeIva)
    let Retenciones = (TotalIngresosAntesDeIva * ValueRetenciones);
    Retenciones = Math.round(Retenciones);
    console.log(Retenciones)

    updatedQuoteDetail.withholdingAtSourceValue = Retenciones;






    // UTILIDAD COMERCIALES

    //UTILIDAD - LIQUIDEZ FINAL
    console.log(TotalIngresosAntesDeIva)
    console.log(TotalGastoAntesDeIva)
    console.log(Retenciones)
    const UtilidadLiquidezFinal = TotalIngresosAntesDeIva - TotalGastoAntesDeIva - Retenciones
    console.log(UtilidadLiquidezFinal);


    // % UTILIDAD ROI - LIQUIDEZ FINAL
    let PorcentajeUtilidadRoi_LiquidezFinal = (UtilidadLiquidezFinal / TotalGastoAntesDeIva) * 100;
    PorcentajeUtilidadRoi_LiquidezFinal = Math.round(PorcentajeUtilidadRoi_LiquidezFinal * 100) / 100;
    console.log(PorcentajeUtilidadRoi_LiquidezFinal);



    // RATIO UTILIDAD MENSUAL
    let RatiosUtilidadMensual = (PorcentajeUtilidadRoi_LiquidezFinal / DiasPagoClienteCorporativo) * 30;
    // RatiosUtilidadMensual = Math.round(RatiosUtilidadMensual * 100 ) / 100;
    console.log(RatiosUtilidadMensual);




    // RENTABILIDAD MINIMA ESPERADA

    let F622 = DiasPagoClienteCorporativo;
    let C566 = 0.04; // 4.0% en formato decimal
    let C54 = 0.08; // 8.0% en formato decimal

    // Comprueba si F622 es mayor que 30
    let RentabiliadMinima =
      F622 > 30 ? (C566 / 30) * F622 : (C54 / 30) * F622;

    // Formatea el resultado como porcentaje
    let RentabiliadMinimaEsperada = parseFloat((RentabiliadMinima * 100).toFixed(2));
    console.log(RentabiliadMinimaEsperada);
    updatedQuoteDetail.profitability = RentabiliadMinimaEsperada;

    console.log()

    // DESCUENTO SUGERIDO AL COMERCIAL
    const F72 = UtilidadLiquidezFinal;
    const C60 = TotalGastoAntesDeIva;
    const F69 = Retenciones;
    const F76 = RentabiliadMinimaEsperada / 100; // Convertir el porcentaje a decimal (4%)
    const F60 = TotalIngresosAntesDeIva;

    console.log(UtilidadLiquidezFinal)
    console.log(TotalGastoAntesDeIva)
    console.log(Retenciones)
    console.log(RentabiliadMinimaEsperada)
    console.log(TotalIngresosAntesDeIva)

    const resultadoDescuentoSgerido = ((F72 - ((C60 + F69) * F76)) / F60) * 100; // Calculamos el resultado en porcentaje
    console.log(resultadoDescuentoSgerido);


    //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
    updatedQuoteDetail.maximumDiscount = resultadoDescuentoSgerido;
    console.log(resultadoDescuentoSgerido)



    // VALORES FINALES DE VENTA ========================

    // SUBTOTAL CON DESCUENTO
    const SubTotalFinalesDeIva = TotalIngresosAntesDeIva;
    console.log(SubTotalFinalesDeIva);

    updatedQuoteDetail.subTotal = SubTotalFinalesDeIva;
    updatedQuoteDetail.totalAdditionalDiscount = 0;
    updatedQuoteDetail.subTotalWithDiscount = updatedQuoteDetail.subTotal || 0;
    updatedQuoteDetail.totalCost = SubTotalFinalesDeIva; // Subtotal con descuento
    updatedQuoteDetail.totalValueWithoutIva = updatedQuoteDetail.subTotal || 0;


    let IvaSnTotalFinal: number = (19 / 100) * SubTotalFinalesDeIva;
    IvaSnTotalFinal = Math.round(IvaSnTotalFinal);
    console.log(IvaSnTotalFinal);


    updatedQuoteDetail.iva = IvaSnTotalFinal;


    let TotalVenta: number = SubTotalFinalesDeIva + IvaSnTotalFinal;
    TotalVenta = Math.round(TotalVenta);
    console.log(TotalVenta);
    updatedQuoteDetail.totalValue = TotalVenta;




    // UTILIDADES FINALES


    // UTILIDAD FINAL CON DESCUENTO
    let UtilidadFinalConDescuento = SubTotalFinalesDeIva - TotalGastoAntesDeIva - Retenciones
    UtilidadFinalConDescuento = Math.round(UtilidadFinalConDescuento);

    console.log(UtilidadFinalConDescuento)

    updatedQuoteDetail.businessUtility = UtilidadFinalConDescuento;

    // % UTILIDAD FINAL CON DESCUENTO
    let PorcentajeUtilidadFinalConDescuento = (UtilidadFinalConDescuento / (TotalGastoAntesDeIva + Retenciones)) * 100;
    // PorcentajeUtilidadFinalConDescuento = Math.round(PorcentajeUtilidadFinalConDescuento);

    console.log(PorcentajeUtilidadFinalConDescuento)


    //* SE HACE DESCUENTO ADICIONAL POR EL COMERCIAL (YA HECHO)
    // let additionalDisccount: number = updatedQuoteDetail.additionalDiscount > 0 ? totalPrice * (1 - updatedQuoteDetail.additionalDiscount) : 0;
    // totalPrice -= additionalDisccount;


    //* PRECIO TOTAL ANTES DE IVA (YA HECHO)




    updatedQuoteDetail.totalGasto = TotalGastoAntesDeIva;
    updatedQuoteDetail.totalIngresos = TotalIngresosAntesDeIva;
    updatedQuoteDetail.rentabilidadMininaEsperada = RentabiliadMinimaEsperada;
    updatedQuoteDetail.descuentoSugerido = resultadoDescuentoSgerido;
    updatedQuoteDetail.UtilidadFinal = UtilidadFinalConDescuento;
    updatedQuoteDetail.porcentajeUtilidadFinal = PorcentajeUtilidadFinalConDescuento;




    cartQuoteDb.ivaTotal += IvaSnTotalFinal;
    cartQuoteDb.subTotal += SubTotalFinalesDeIva;



    //* IVA DE LA VENTA
    // const iva: number = (product.iva / 100) * totalPrice || 0;
    // totalPrice += iva;
    // totalCost += iva;

    //* CALCULAR PRECIO FINAL AL CLIENTE, REDONDEANDO DECIMALES
    // Math.round(updatedQuoteDetail.totalValue);

    //* CALCULAR EL COSTO DE LA RETENCIÓN EN LA FUENTE
    // const withholdingAtSource: number = systemConfig.withholdingAtSource || 0;
    // const withholdingAtSourceValue: number = (totalPrice * withholdingAtSource / 100) || 0;

    // totalPrice += withholdingAtSourceValue;
    // totalCost += withholdingAtSourceValue;
    // cartQuoteDb.withholdingAtSourceValue = withholdingAtSourceValue;

    //* CALCULAR UTILIDAD DEL NEGOCIO
    // const businessUtility = (totalPrice - (totalCost - withholdingAtSourceValue)) || 0;
    // updatedQuoteDetail.businessUtility = businessUtility;

    //* CALCULAR RENTABILIDAD DEL NEGOCIO
    // const profitability: number = (businessUtility / totalPrice) || 0;
    // updatedQuoteDetail.profitability = profitability;

    //* CALCULAR DESCUENTO
    // const discount: number = (product.promoDisccount / 100) * totalPrice || 0;

    updatedQuoteDetail.discountPercentage = 0; // reutilizar

    updatedQuoteDetail.discount = product.promoDisccount;
    // totalPrice -= discount;

    //* CALCULAR SUBTOTAL CON DESCUENTO

    // * CALCULAR % MARGEN DE GANANCIA DEL NEGOCIO Y MAXIMO DESCUENTO PERMITIDO AL COMERCIAL
    const businessMarginProfit: number = (totalPrice - updatedQuoteDetail.totalValueWithoutIva);
    updatedQuoteDetail.businessMarginProfit = businessMarginProfit;
    cartQuoteDb.totalPrice += TotalVenta;

    console.log(cartQuoteDb.totalPrice)

    // //TODO MÁXIMO DESCUENTO PERMITIDO AL COMERCIAL
    // updatedQuoteDetail.maximumDiscount = 20;

    console.log(updatedQuoteDetail.transportTotalPrice)

    Object.assign(quoteDetail, updatedQuoteDetail);

    let updatedCartQuote: CartQuote = cartQuoteDb;

    if (saveData == 1) {
      updatedCartQuote = await this.cartQuoteRepository.save(cartQuoteDb);
      await this.quoteDetailRepository.save(quoteDetail);
    }

    return {
      updatedQuoteDetail,
      cartQuoteDb
    };
  };


  

}