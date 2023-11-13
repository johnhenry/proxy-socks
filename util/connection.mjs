import { invertedAsyncIterator } from "./index.mjs";

const doConnection = (
  connection,
  {
    filter = () => true,
    transform = (x) => ({ ...x }),
    showSent,
    showFiltered,
    showRecieved,
  } = {
    filter: () => true,
    transform: (x) => ({ ...x }),
  }
) => {
  try {
    const send = (data) => {
      if (showSent) {
        console.log("SENT", data);
      }
      connection.send(JSON.stringify(transform(data)));
    };
    const [generator, enqueue] = invertedAsyncIterator();
    connection.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (showRecieved) {
        console.log("RECIEVED", data);
      }
      if (filter(data)) {
        if (showFiltered) {
          console.log("FILTERED", data);
        }
        enqueue(data);
      }
    });
    return [send, generator(), connection.close.bind(connection)];
  } catch (error) {
    console.error(error);
  }
};

export { doConnection };
export default doConnection;
