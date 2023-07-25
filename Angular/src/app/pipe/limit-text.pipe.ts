import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitText'
})
export class LimitTextPipe implements PipeTransform {

  transform(value: string, args: string): unknown {
    let limit:number = args ? parseInt(args, 10) : 10;
    let trail:string = '...';

    var v:string = value.length > limit ? value.substring(0, limit) + trail : value;
    return v;
  }

}
