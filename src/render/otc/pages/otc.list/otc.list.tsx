import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useObservable } from "rxjs-hooks";
import useSWR from "swr";
// import { Table }
import { Breadcrumb, BreadcrumbItem } from "frame/breadcrumb/breadcrumb";
// import { Empty } from 'frame/empty/empty';
// import { Skeleton } from 'frame/skeleton/skeleton';
import { Button } from "frame/button/button";
import { Input } from "frame/input/input";
import { Option, Select } from "frame/select";
import { Overlay } from 'frame/overlay/overlay';
import { toThousands } from 'frame/utils/tools';

export default () => {
  return <div>👴</div>
}