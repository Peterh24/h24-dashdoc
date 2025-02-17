import { inject } from "@angular/core";
import { FILE_IMAGE_MAX_WIDTH } from "src/app/services/constants";
import { TransportOrderService } from "src/app/services/transport-order.service";

export class NewOrderCommon {
    constructor (
    ) {

    }

    getTransportErrors (transport: any) {
        const errors: any[] = [];
        const origins = transport.getOrigins().length;
        const destinations = transport.getDestinations().length;

        if (transport.isMultipoint) {
          if (!origins || origins != destinations) {
            errors.push ("Enlèvement / livraison manquant");
          }
        } else {
          if (!origins) {
            errors.push ("Enlèvement manquant");
          }

          if (!destinations) {
            errors.push ("Livraison manquante");
          }
        }

        return errors;
    }

    getDeliveryErrors (transport: TransportOrderService, delivery: any, type: string = null) {
        const errors = [];
        const isOrigin = type === null || type === 'origin';
        const isDestination = type === null || type === 'destination';

        if (this.isMultipointDeliveryInvalid (transport, delivery)) {
            errors.push ("L'horaire d'enlèvement est invalide");
        }

        if (delivery.origin?.address?.address) {
            if (!delivery.origin?.address?.address) {
                errors.push ("Veuiller saisir une addresse d'enlèvement");
            }

            if (!delivery.loads?.length && !delivery.planned_loads?.length) {
                errors.push ("Veuillez préciser les marchandises transportées")
            }

            if (!delivery.tracking_contacts?.length) {
                errors.push ("Veuiller saisir un contact");
            }

            if (!delivery.origin?.slots?.[0]?.start) {
                errors.push ("Veuiller saisir une date d'enlèvement");
            }

            if (this.isSlotExceeded (delivery.origin?.slots?.[0]?.start)) {
                errors.push ("La date d'enlèvement est dépassée");
            }
        }

        if (delivery.destination?.address?.address) {
            if (!delivery.destination?.address?.address) {
                errors.push ("Veuiller saisir une addresse de livraison");
            }

            if (!delivery.tracking_contacts?.length) {
                errors.push ("Veuiller saisir un contact");
            }

            if (!delivery.destination?.slots?.[0]?.start) {
                errors.push ("Veuiller saisir une date de livraison");
            }

            if (this.isSlotExceeded (delivery.destination?.slots?.[0]?.start)) {
                errors.push ("La date de livraison est dépassée");
            }
        }

        return errors;
    }

    isSlotExceeded (date: string) {
        if (!date) {
          return false;
        }

        const day = new Date(date).toISOString ().split (/T/)[0];
        const now = new Date().toISOString ().split (/T/)[0];

        return new Date(day).valueOf() < new Date(now).valueOf ();
    }

    isMultipointDeliveryInvalid (transport: any, delivery: any) {
        const index = transport.deliveries?.findIndex ((d: any) => d === delivery);

        if (transport.isMultipoint) {
          const delivery = transport.deliveries[index];
          if (index > 0) {
            const previousDelivery = transport.deliveries[index -1];

            return new Date (delivery.origin?.slots?.[0]?.start) <
              new Date (previousDelivery.destination?.slots?.[0]?.start);
          }
        }

        return false;
    }
}