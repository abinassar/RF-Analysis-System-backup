import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: number, limit: number): string {

    let numberString = value.toString();

    return numberString.substring(0, limit);

  }

}
