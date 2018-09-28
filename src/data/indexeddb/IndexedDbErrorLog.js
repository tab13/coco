import Abstract from './IndexedDbAbstract';

export default class IndexedDbErrorLog extends Abstract {
    static className = 'IndexedDbActionLog';

    main_table = 'error_log';
    primary_key = 'action_id';
    offline_id_prefix = 'action';
}