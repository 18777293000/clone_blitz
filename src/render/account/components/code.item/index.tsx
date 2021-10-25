import React, { useState, useEffect } from "react";
import './style.scss';
import { Form, FormItem } from "../../../../frame/form";
import { SMSCodeService, phoneCodeService, VoiceCodeService } from '../../../../services/account/phone.code';
import { PhoneAccount, EmailAccount } from "../../../../types/account";
