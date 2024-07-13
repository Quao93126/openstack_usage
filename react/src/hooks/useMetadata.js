import { useEffect, useState } from 'react';
import { createLoader } from '@/helpers/avivator';
import { useExperimentStore } from '@/stores/useExperimentStore';
import store from '@/reducers';
import XMLParser from 'react-xml-parser';

function parseJsonTemp(jsonObject) {
  var res = {};
  var res1 = jsonObject['attributes'];
  if (res1.xmlns === undefined) {
    const json1 = JSON.stringify(res1);
    res = JSON.parse(json1);
  }
  if (jsonObject['children'].length == 0) return res;
  jsonObject['children'].map((child) => {
    const name = child.name;
    if (res[name] !== undefined) {
      if (!Array.isArray(res[name])) {
        var temp = res[name];
        res[name] = [];
        res[name].push(temp);
      }
      res[name].push(parseJsonTemp(child));
    } else res[name] = parseJsonTemp(child);
  });
  return res;
}

const getXMLData = async (path) => {
  return await fetch(path)
    .then((response) => response.text())
    .then((text) => {
      var xmljson = new XMLParser().parseFromString(text);
      //console.log(xmljson);
      return xmljson;
    })
    .catch(() => {});
};

export default function useMetadata(urls, onLoading = () => void 0) {
  const { metadataMap, updateMetadataMap } = useExperimentStore();
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      onLoading(true);

      //console.log(metadataMap);

      const metadatatemp = await Promise.all(
        urls.map((url) => {
          // if(metadataMap[url]){
          //   return Promise.resolve([{metadata: metadataMap[url]}]);
          // }
          const xmlurl = url.replace('.tiff', '.xml');
          return getXMLData(xmlurl);
        }),
      );

      var metadata = metadatatemp.map((meta) => parseJsonTemp(meta)['OME']);
      store.dispatch({ type: 'set_MetaData', content: metadata });

      const map = metadata.reduce(
        (acc, data, idx) => (data ? { ...acc, [urls[idx]]: data } : acc),
        {},
      );
      setMetadata(metadata.filter(Boolean));
      updateMetadataMap(map);
      setLoading(false);
      onLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls, updateMetadataMap]);

  return [metadata, loading];
}
