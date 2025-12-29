# Roards_Coord
Built on top of https://github.com/anvaka/city-roads. It renders roads around user-input coordinates with user-input radius.

## How it is made?
The data is fetched from OpenStreetMap using overpass API. While that API is free (as long as you follow ODbL licenses), it can be rate-limited and sometimes it is slow. To increase efficency, it is requested to render a small radius around the specified coordinates ~0.1 - 2km.

To improve the performance of download, the inital repo indexed ~3,000 cities with population larger than 100,000 people and stored into a very simple protobuf format. The cities are stored into a cache in this github repository. The cache currently only works for complete City Roads rendering.

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
