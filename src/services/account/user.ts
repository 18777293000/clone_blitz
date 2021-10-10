import { BehaviorSubject } from 'rxjs';
import { singleton, container } from '../../common/services/di';
import { LocalStorageService } from '../../common/storage/local.storage';
import { addMiddlewareForHTTP, HttpOptions } from '../../frame/utils/http';
import { StorageScope } from '../../common/storage/storage';
import { bkEventServiceFactory } from '../../common/services/event';
import { getProfile, logout, setPubkey } from '../../api/account';
