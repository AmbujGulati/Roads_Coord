# Roards_Coord
Built on top of https://github.com/anvaka/city-roads.
Renders Roads around specific input coordinates with specified radius

## How it is made?
The data is fetched from OpenStreetMap using overpass API. While that API is free (as long as you follow ODbL licenses), it can be rate-limited and sometimes it is slow. To increase efficency, it is requested to render a small radius around the specified coordinates ~0.1 - 2km.

## Local development

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Credits
The source code is forked from anvaka. [https://github.com/anvaka]

## License

The source code is licensed under MIT license
