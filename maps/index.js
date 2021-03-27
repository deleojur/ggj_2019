const fs = require("fs-extra");
const path = require('path');

// JSON file
let fileName = "map_1.json";

// the file is read synchronously in this example
// you can read it asynchronously also
const worldMap = JSON.parse(fs.readFileSync(fileName));

const tileIds = parseLayers();
const tiles = parseTilesets(tileIds);
tiles.forEach(tile =>
{
    fs.copySync(path.resolve(__dirname, tile.imageUrl), path.join(__dirname, '../game-client/src/assets', tile.imageUrl));
});
fs.copySync(path.resolve(__dirname, fileName), path.join(__dirname, '../game-client/src/assets', fileName));

function parseLayers()
{
    const layers = worldMap.layers;
    const uniqueTileIds = new Set();
	
    layers.forEach(layer => 
    {
        if (layer.type === 'tilelayer')
        {
            const imageIds = [...new Set(layer.data)];
            imageIds.forEach(id =>
            {
                uniqueTileIds.add(id);
            });
        } else if (layer.type === 'objectgroup')
        {
            layer.objects.forEach(obj =>
            {
                uniqueTileIds.add(obj.gid);
            });
        }
    });
    return uniqueTileIds;
}

function parseTilesets(uniqueTileIds)
{        
    const tilesets = worldMap.tilesets;
    const uniqueTiles = new Set();
    tilesets.forEach(tileset => 
    {
        const firstgid = tileset.firstgid;
        tileset.tiles.forEach(tile =>
        {
            const id = firstgid + tile.id;        
            if (uniqueTileIds.has(id))
            {
                uniqueTiles.add({ id: id, imageUrl: tile.image });
            }
        });
    });
    return uniqueTiles;
};