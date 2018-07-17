# ng-node-socket

Tested for angular5

## Installation
```
npm install ng-node-socket
```

## How to use
-- app.module.ts
```
import { SocketService } from 'ng-node-socket';
@NgModule({
  providers: [  SocketService ]
})

```
-- app.componet.ts
```
import { SocketService } from 'ng-node-socket';

export class AComponent {
    constructor(protected socket:SocketService) {
        socket.init('http://xxx.xxx.xxx.xxx:yy');

        this.socket.On('connection').subscribe(obj => {
           console.log(obj);
        });

        this.socket.Emit('someThing1');
        this.socket.Emit('someThing1', arg1, ....);
        this.socket.EmitCallback(function(data){console.log(data)}, 'someThing1');
        this.socket.On('someThing2').subscribe(obj => {
            console.log(obj);
		});
    }
}
```

##### if you got an error 'global is not defined' please put '(window as any).global = window;' to your polyfills.ts or elsewhere what you want
