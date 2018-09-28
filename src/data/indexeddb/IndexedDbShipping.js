import Abstract from './IndexedDbAbstract';

export default class IndexedDbShipping extends Abstract {
    static className = 'IndexedDbShipping';

    main_table = 'shipping';
    primary_key = 'code';
    offline_id_prefix = '';

    // /**
    //  * Constructor
    //  * @param props
    //  */
    // constructor(props) {
    //     super(props);
    // }
}