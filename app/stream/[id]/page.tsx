import { RemoteStream } from "./RemoteStream";

export default function StreamPage({
  params
}: {
  params: {
    id: string
  }
}) {
  return (<>
    <h1>View Stream</h1>
    <div>
      <label> Stream ID </label>
      <input type="text" value={params.id} disabled />
      <RemoteStream id={params.id} />
    </div>
  </>);
}
