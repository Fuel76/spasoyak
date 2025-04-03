import {useParams} from 'react-router-dom';

export const ViewNewsPage = () => {
    const {neww} = useParams() as {neww: string}
    

  return (
    <div>
      <h1>{neww}</h1>

    </div>
  );
};