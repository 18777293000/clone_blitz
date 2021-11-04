import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import './style.scss';
import { useObservable } from "rxjs-hooks";
import { Routes, Route, useNavigate } from "react-router";
import { I18nServiceFactory } from "common/services/i18n";
import { userServiceFactory } from "services/account/user";
import { globalConfigerviceFactory } from "services/global/config";
import NavLayout from 'render/layout/components/nav-layout';
import { INavMenu, INavMenuChild } from "render/layout/components/nav-layout/nav.layout";
export default () => {
  return <div>👴</div>
}