'use client'
import ClientOnly from "@/components/ClientOnly";
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "@/components/ui/VerticalDotsIcon";
import Modal from "@/components/ui/Modal";
interface Covers{
    
    name:string,
    image:string,
    s3Link:string,
    videoTitle:string,
    voice:string,
    ytUrl:string
    ytThumb:string
}



const statusColorMap = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const initailModal = {
  showModal: false,
  isLoading: false,
  isError: "",
};

const INITIAL_VISIBLE_COLUMNS = [
    {name: "VOICE", uid: "voice", sortable: false},
    {name: "VIDEO", uid: "video", sortable: false,},
    {name: "CREATOR", uid: "creator", sortable: false},
    {name: "ACTIONS", uid: "actions"},
  ];

const voices = {
    "Modi":{src:'./Modi.webp',name:'Narendra Modi'},
    "Biden":{src:'./Biden.webp',name:'Joe Biden'},
    "Elon":{src:'./Elon.jpg',name:'Elon Musk'},
    "SRK":{src:'./SRK.jpg',name:'Shah Ruk Khan'},
    "Trump":{src:'./Trump.webp',name:'Donald Trump'}
}

export default function Creative() {
const [data,setData] = React.useState<Covers[]>([])

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const [modal, setModal] = React.useState(initailModal);

  const { showModal, isLoading, isError } = modal;


  const headerColumns = React.useMemo(() => {
    return INITIAL_VISIBLE_COLUMNS;
  }, []);

  

  const pages = data.length>0 ? Math.ceil(data.length / rowsPerPage) : 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return data.slice(start, end);
  }, [page, data, rowsPerPage]);

  const startTimer = (time = 1000,cb:Function|undefined=undefined) => {
    setTimeout(() => {
      setModal((p) => {
        return { ...p, showModal: false, isError: "", isLoading: false };
      });
      if(cb!==undefined){
        cb()
      }
      
    }, time);
  };

  const handleDownload = async (s3Url:string,title:string,voice:string)=>{

    
    const downloadLink = document.createElement('a');
    downloadLink.href = s3Url;
    downloadLink.download = title+voice;
    downloadLink.style.display = 'none'; // Hide the anchor element
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setModal((p) => {
      return { ...p, isLoading: false, showModal: true ,isError:'Started Downloading'};
    });
    startTimer(2000)
  }

  const handleCopy =async(link:string)=>{
    await navigator.clipboard.writeText(link)
    setModal((p) => {
      return { ...p, isLoading: false, showModal: true ,isError:'Copied'};
    });
    startTimer(1000)
  }
  const renderCell = React.useCallback((user:Covers, columnKey:any) => {
    //@ts-ignore
    const cellValue = user[columnKey];
    console.log('cellvalue',{user,columnKey})
    switch (columnKey) {
      case "creator":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.image }}
            name={user.name}
          >
            {user.name}
          </User>
        );
      case "voice":
        return (
            <User
            //@ts-ignore
            avatarProps={{ radius: "lg", src: voices[user.voice]['src'] }}  name={voices[user.voice]['name']}>{voices[user.voice]['name']}
          </User>
        );
      case "video":
        return (
          <div className="md:w-[200px] sm:w-[100px] h-[50px] overflow-hidden">
            <Button
            size="sm"
            variant="flat"
            onPress={()=>{window.open(user.ytUrl, '_blank');}}
          >
            <User
            avatarProps={{ radius: "lg", src: user.ytThumb}}
            // description={user.videoTitle}
            name={user.videoTitle}
          >
            {user.videoTitle}
          </User>
          </Button>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown >
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" >
                  <VerticalDotsIcon className="text-default-300" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu classNames={{base:["bg-black"]}}>
                <DropdownItem onClick={async()=>{await handleCopy(user['s3Link'])}}><span className="text-white">Share</span></DropdownItem>
                <DropdownItem onClick={()=>{handleDownload(user['s3Link'],user['videoTitle'],user['voice'])}}><span className="text-white">Download</span></DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e:React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);


  const onClear = React.useCallback(() => {
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {data.length} covers
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    onRowsPerPageChange,
    data.length
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            isDisabled={pages === 1}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }, [items.length, page, pages]);

  React.useEffect(() => {
    setModal((p) => {
      return { ...p, isLoading: true, showModal: true ,isError:''};
    });
    fetch("api/creative")
      .then((res) => res.json())
      .then((data) => {
        if(data.covers.length<=0){
          setModal((p) => {
            return { ...p, isLoading: false, showModal: true ,isError:data.err};
          });
          startTimer(2000)
        }else{
          setData(data.covers)
          setModal((p) => {
            return { ...p, isLoading: false, showModal: true ,isError:'Done'};
          });
          startTimer(1000)

        }
        
      }).catch(err=>{
        setModal((p) => {
          return { ...p, isLoading: false, showModal: true ,isError:'Something went wrong'};
        });
        startTimer(2000)
      })
  }, []);

  return (
    <ClientOnly>
      <Modal showModal={showModal} isLoading={isLoading} isError={isError} />

      <div className="w-full">
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: ["max-h-[382px]", "max-w-full","bg-black"],
          base:["p-10","sm:p-2"]
        }}
        // removeWrapper
        // selectedKeys={selectedKeys}
        // selectionMode="multiple"
        // sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        // onSelectionChange={setSelectedKeys}
        // onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No covers found"} items={data}>
          {(item) => (
            <TableRow key={item.image}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </ClientOnly>
  );
}
