# MMM-vCard2Calendar

MagicMirror² Module to add the birthday of contacts to the default calendar module.

## Example
```js
{
    module: 'MMM-vCard2Calendar',
    config: {
        url: '<link to vCard>',
        auth: {                     // basic authentication for request
            user: '<user>',
            password: '<password>'
        }
    }
},
{
    module: 'calendar',
    position: 'top_left',
    config: {
        calendars: {
            symbol: 'birthday-cake',
            url: 'http://localhost:8080/MMM-vCard2Calendar' //This url is fixed
        }
    }
}
```

## Installation
1. Clone this repository in your MagicMirror installation into the folder modules.
2. Install dependencies in main MagicMirror folder
3. Add a config like above

## Config Options
| **Option**        | **Description** |
| --- | --- |
| `url`             | vCard source url **(required)**
| `auth`            | Basic authentication credentials (optional)

### Authentication Options
| **Option**        | **Description** |
| ---               | ---             |
| `user`            | Username for basic HTTP authentication |
| `pass`            | Password for basic HTTP authentication |

## Limitations
* Only one vCard url is supported.
