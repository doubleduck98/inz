import {
  useCombobox,
  Combobox,
  InputBase,
  Loader,
  Input,
  CloseButton,
  ScrollArea,
} from '@mantine/core';
import { useState } from 'react';
import axiosInstance from '@/utils/Axios';
import { Room } from '../types/Room';

interface RoomSelectProps {
  defaultValue: string;
  errorProps: React.ReactNode;
  setRoomValue: (value: string) => void;
  setRoomIdValue: (value: number | null) => void;
}

const RoomSelect = ({
  defaultValue,
  errorProps,
  setRoomValue,
  setRoomIdValue,
}: RoomSelectProps) => {
  const [value, setValue] = useState<string | null>(defaultValue);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Room[]>([]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (data.length === 0 && !loading) {
        setLoading(true);
        fetchOptions();
      }
    },
  });

  const fetchOptions = async () => {
    const opts = {
      url: `Bookings/Rooms`,
      method: 'GET',
    };
    try {
      const { data } = await axiosInstance.request(opts);
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  const roomFmt = (id: string) => {
    const rId = parseInt(id);
    const room = data?.find((r) => r.id == rId);
    return room ? `${room?.name}` : '';
  };

  const options = data.map((item) => (
    <Combobox.Option value={`${item.id}`} key={item.id}>
      {item.name}
    </Combobox.Option>
  ));

  const rightSection = () => {
    if (loading) return <Loader size={18} />;
    if (!value) return <Combobox.Chevron />;
    return (
      <CloseButton
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setRoomIdValue(null);
          setValue('');
        }}
      />
    );
  };

  return (
    <Combobox
      store={combobox}
      withinPortal={true}
      onOptionSubmit={(val) => {
        setValue(roomFmt(val));
        setRoomValue(roomFmt(val));
        setRoomIdValue(parseInt(val));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          label="Sala"
          rightSection={rightSection()}
          error={errorProps}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents={value ? 'all' : 'none'}
        >
          {value || <Input.Placeholder>Wybierz salę</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={200}>
            {loading ? <Combobox.Empty>Szukam...</Combobox.Empty> : options}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default RoomSelect;
