# gba-serialize

Build declarative structures to extract potentially complex binary data from a GBA ROM into plain JavaScript objects.

You can build schemas to handle a variety of binary structures including:

- 8, 16 and 32 integers (both signed and unsigned)
- Booleans
- GBA Colors (RGB555)
- Enums
- ROM Pointers
- ASCII and Custom Encoding Text
- Arrays (Dynamic and Statically sized)
- Tuples
- Record Structures
- Lists with a sentinel value
- LZSS compressed data
- Bitfields
- Images

For example,

```javascript
import { PointerSchema, Word } from '@touched/gba-serialize';

const pointerToWord = new PointerSchema(Word);

unpack(new Buffer([0xef, 0xbe, 0xad, 0xde]));
// 0xdeadbeef
```

You can build incredibly complicated schemas using the API. Currently it has the ability to completely unpack every map (sans scripts) in a FireRed ROM in a few seconds.

## API

No documentation yet. See the tests for examples.

## License

GPLv3
