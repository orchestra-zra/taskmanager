import { useQuery } from '@tanstack/react-query';
import getUsersData from '../../../common/getUsersData';

export const useGetUsers = (groupId: number) => {
  return useQuery({
    queryKey: ['users', groupId],
    queryFn: () => getUsersData(groupId.toString()),
    enabled: !!groupId
  });
};
