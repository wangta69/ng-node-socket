# ng-node-socket

Tested for angular5

## Installation
```
npm install ng-node-socket
```

## How to use
``` app.module.ts
import { SocketService } from ng-node-socket'
@NgModule({
  providers: [  SocketService ]
})

```

``` app.componet.ts
import { SocketService } from 'ng-node-socket'

export class AComponent{
    constructor(protected socket:SocketService){
        socket.init('http://182.162.136.223:50000');

         this.socket.Emit('someThing1');
         this.socket.Emit('someThing1', arg1, ....);
         this.socket.EmitCallback(function(data){console.log(data)}, 'someThing1');
         this.socket.On('someThing2').subscribe(obj => {
            console.log(obj);
		});

    }
}
```
