
// operation enums
var Operator = {
    PLUS: 0,
    MINUS: 1,
    TIMES: 2,
    SLASH: 3,
    PWR: 4,
    SQRT: 5,
    LN: 6,
    EXP: 7,
    LOG: 8,
    ANTILOG: 9
}

class SignificantNumber {
    constructor( number, sigfigs ) {
        // Data class for storage of numbers with significant figure values
        this.number = number;
        this.sigfigs = sigfigs;
    }
    get num() {
        return this.number;
    }
    get sf() {
        return this.sigfigs;
    }
}

class SignificantOperation {
    constructor( sig_number_1, sig_number_2, operation ) {
        /* 
         * Rules of significant figures:
         * Addition and subtraction uses left-most significant digit of the added numbers
         * Division and multiplication uses lowest siginficance count of the added numbers
         * Logarithms keep the number of significant digits after the decimal place as were in the original number
         * Antilogarithms have the same number of significant digits as there were significant digits after the decimal in the original number
         * Square roots have one more significant figure than the original number
         * Powers have one less significant figure than the original number
         * 
         */
        if( operation === Operator.PLUS )           this.answer = this.op_add( sig_number_1, sig_number_2 );
        else if( operation === Operator.MINUS )     this.answer = this.op_subtract( sig_number_1, sig_number_2 );
        else if( operation === Operator.TIMES )     this.answer = this.op_multiply( sig_number_1, sig_number_2 );
        else if( operation === Operator.SLASH )     this.answer = this.op_divide( sig_number_1, sig_number_2 );
        else if( operation === Operator.PWR )       this.answer = this.op_pwr( sig_number_1, sig_number_2 );
        else if( operation === Operator.SQRT )      this.answer = this.op_sqrt( sig_number_1, sig_number_2 );
        else if( operation === Operator.LN )        this.answer = this.op_ln( sig_number_1, sig_number_2 );
        else if( operation === Operator.EXP )       this.answer = this.op_exp( sig_number_1, sig_number_2 );
        else if( operation === Operator.LOG )       this.answer = this.op_log( sig_number_1, sig_number_2 );
        else if( operation === Operator.ANTILOG )   this.answer = this.op_antilog( sig_number_1, sig_number_2 );
    }
    op_add( sig_number_1, sig_number_2 ) {
        // the p(n) variable represents highest digit ranking, where the rank corresponds to the highest value-bearing digit of the number
        // the l(n) variable represents last significance ranking, where the rank corresponds to the last significant digit of the number
        // l(n) is determined by the formula p(n) + sf(n) - 1, where sf(n) is the number of significant figures of the number
        // see this series for reference on which digit the values of l(n) and p(n) values refer to:
        // ranking: -6 -5 -4 -3 -2 -1  0   1  2  3  4  5  6
        // number:   1  2  3  4  5  6  7 . 8  9  0  1  2  3
        let n1 = sig_number_1.num;
        let p1 = this.highest_digit_ranking( n1 );
        let l1 = p1 + sig_number_1.sf - 1;
        let n2 = sig_number_2.num;
        let p2 = this.highest_digit_ranking( n2 );
        let l2 = p2 + sig_number_2.sf - 1;
        let n3 = n1 + n2;
        let p3 = this.highest_digit_ranking( n3 );
        return new SignificantNumber( n3, Math.min( l1, l2 ) - p3 + 1 );
    }
    op_subtract( sig_number_1, sig_number_2 ) {
        // hijacks op_add because subtraction is addition witih a negative sign
        return this.op_add( sig_number_1, new SignificantNumber( -sig_number_2.num, sig_number_2.sf ) );
    }
    op_multiply( sig_number_1, sig_number_2 ) {
        return new SignificantNumber( sig_number_1.num * sig_number_2.num, Math.min( sig_number_1.sf, sig_number_2.sf ) );
    }
    op_divide( sig_number_1, sig_number_2 ) {
        return new SignificantNumber( sig_number_1.num / sig_number_2.num, Math.min( sig_number_1.sf, sig_number_2.sf ) );
    }
    op_pwr( sig_number_1, sig_number_2 ) {
        // only the significance of the first input is taken into account
        return new SignificantNumber( Math.pow( sig_number_1.num, sig_number_2.num ), sig_number_1.sf - 1 );
    }
    op_sqrt( sig_number_1, sig_number_2 ) {
        // only the first input is used
        return new SignificantNumber( Math.sqrt( sig_number_1.num ), sig_number_1.sf + 1 );
    }
    op_ln( sig_number_1, sig_number_2 ) {
        // use the first input only for signficant values; second input is treated as e
        let sf = sig_number_1.sf;
        let n = Math.log( sig_number_1.num );
        let p = this.highest_digit_ranking( n );
        if( p < 1 ) sf += 1 - p;
        return new SignificantNumber( n, sf );
    }
    op_exp( sig_number_1, sig_number_2 ) {
        // use the first input only for signficant values; second input is treated as e
        // p represents highest digit ranking; l represents last significance ranking
        // the number of significant figures is determined based on the value of p
        // if p > 0, then retain the previous significance count; else, use a new computed value
        let n = sig_number_1.num;
        let p = this.highest_digit_ranking( n );
        let sf;
        if( p > 0 ) sf = sig_number_1.sf;
        else sf = p + sig_number_1.sf - 1;
        return new SignificantNumber( Math.exp( n ), sf );
    }
    op_log( sig_number_1, sig_number_2 ) {
        // use the first input only for signficant values; second input is treated as 10
        let sf = sig_number_1.sf;
        let n = Math.log10( sig_number_1.num );
        let p = this.highest_digit_ranking( n );
        if( p < 1 ) sf += 1 - p;
        return new SignificantNumber( n, sf );
    }
    op_antilog( sig_number_1, sig_number_2 ) {
        // use the first input only for signficant values; second input is treated as 10
        // p represents highest digit ranking; l represents last significance ranking
        // the number of significant figures is determined based on the value of p
        // if p > 0, then retain the previous significance count; else, use a new computed value
        let n = sig_number_1.num;
        let p = this.highest_digit_ranking( n );
        let sf;
        if( p > 0 ) sf = sig_number_1.sf;
        else sf = p + sig_number_1.sf - 1;
        return new SignificantNumber( Math.pow( 10, n ), sf );
    }
    highest_digit_ranking( n ) {
        // highest digit rank is determined by cycling through the number, either dividing or multiplying by ten
        if( n === 0 ) return Infinity;
        let p = 0;
        if( Math.abs( n ) >= 1 ) for( let i = n; 1 > Math.abs( i ) || Math.abs( i ) >= 10; i /= 10 ) p--;
        else for( let i = n; 1 > Math.abs( i ) || Math.abs( i ) >= 10; i *= 10 ) p++;
        return p;
    }
    get result() {
        return this.answer;
    }
}

class SignificantMath {
    constructor( raw_math ) {
        /* 
         * Rules of interpretation:
         * Accept standard numbers (e.g., 10200.0) and scientific notation (e.g., 1.02000e4)
         * Interpret mathematical operators: +, -, *, /, ^
         * Interpret mathematical functions: sqrt, ln, exp, log, antilog
         * Interpret mathematical symbols: e, pi
         * 
         * Loop to break down math string:
         * 1. Remove redundant parentheses
         * 2. Break into subset based on order of priority (parentheses-protected): + and -, * and /, ^, functions
         * For each item in the set:
         * 1. If a symbol, ignore it
         * 2. If a number, convert to SignificantNumber object
         * 3. If a set, recursively go back to the beginning of this loop within that set
         * Again, for each item in the set:
         * 1. If the item is a non-set, ignore
         * 2. If the item is a set, recursively go back to the beginning of this loop within that set
         * 3. With no subsets in the set, convert the set to an Operation object and resolve to a SignificantNumber object, replacing the set
         * 
         * Example decomopsition:
         * [ "34.56*230^(0.0789+ln(546/70.00))" ]
         * [ [ "34.56", "*", "230^(0.0789+ln(546/70.00))" ] ]
         * [ [ "34.56", "*", [ "230", "^", "0.0789+ln(546/70.00)" ] ] ]
         * [ [ "34.56", "*", [ "230", "^", [ "0.0789", "+", "ln(546/70.00)" ] ] ] ]
         * [ [ "34.56", "*", [ "230", "^", [ "0.0789", "+", [ "ln", "546/70.00" ] ] ] ] ]
         * [ [ "34.56", "*", [ "230", "^", [ "0.0789", "+", [ "ln", [ "546", "/", "70.00" ] ] ] ] ] ]
         * 
         */
        let hold = this.breakdown( [ raw_math.replace( /\s/g, "" ).toLowerCase() ] );
        console.log( hold );
        this.solution = this.operate_and_resolve( this.number_convert( hold[ 0 ] ) );
    }
    breakdown( math_set ) {
        // recursive function for identifying when math string expressions need to be broken up
        // it requires taking a list at the beginning and goes through each element of the list
        // each time, it gets rid of unnecessary parentheses and if it finds an element is a
        // list, it replaces the list with the result of a call to itself
        // this allows it to send strings to the string cracker that may end up further down
        // the n-dimensional maximum depth of the true result of the breakdown
        for( let i = 0; i < math_set.length; i++ ) {
            if( !( Array.isArray( math_set[ i ] ) ) ) {
                math_set[ i ] = this.remove_parentheses( math_set[ i ] );
                if( math_set[ i ].substring( 0, 2 ) === "-(" ) math_set[ i ] = "-1*" + math_set[ i ].substring( 1, math_set[ i ].length ); // converts -(x) into -1*(x) for processing; semantically it's the same
            }
            if( Array.isArray( math_set[ i ] ) ) math_set[ i ] = this.breakdown( math_set[ i ] );
            else if( !( this.acceptable_string( math_set[ i ] ) ) ) {
                math_set[ i ] = this.crack_string( math_set[ i ] );
                i--; // resets the list ticker for one more checking pass
            }
        }
        return math_set;
    }
    remove_parentheses( str ) {
        // recursively removes outer redundant parentheses,
        // but keeps outer parentheses relevant to order of operations
        if( str[ 0 ] === "(" && str[ str.length - 1 ] === ")" ) {
            let opened = 0;
            let closed = 0;
            for( let i = 0; i < str.length; i++ ) {
                if( str[ i ] === "(" ) opened++;
                else if( str[ i ] === ")" ) closed++;
                if( closed > 0 && opened === closed && i < str.length - 1 ) return str;
            }
            return this.remove_parentheses( str.substring( 1, str.length - 1 ) );
        } return str;
    }
    acceptable_string( str ) {
        // checks if an individual string is either just a number or just an operator symbol
        if( [ "+", "-", "*", "/", "^" ].includes( str ) ||
            [ "e", "pi" ].includes( str ) ||
            [ "sqrt", "ln", "exp", "log", "antilog" ].includes( str ) ||
            this.only_number_characters( str ) ) return true;
        else return false;
    }
    only_number_characters( str ) {
        // returns false if any characters are not 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ., e, or - in position 0
        for( let i = 0; i < str.length; i++ ) if( !( ( str[ i ] > "/" && str[ i ] < ":" ) || str[ i ] === "." || str[ i ] === "e" || ( str[ i ] === "-" && i === 0 ) ) ) return false;
        return true;
    }
    crack_string( str ) {
        // each time this function is given a string it cracks the string once
        // string cracking is a complex process that needs to split a string into
        // a list while taking into account order of operations (OOO) and parentheses,
        // aiming to split in reverse OOO so that the operations with the highest
        // priority can be computed first in later steps
        // the algorithm parses through each character in the passed string and
        // keeps track of the position and priority of candidate operators, but
        // will disregard candidates if they are between parentheses
        // after completely parsing through the string, the string will be cracked
        // based on the information gathered
        // the below information illustrates the OOO and supported symbols and
        // functions by this function:
        // parentheses-protected order of priority: + and -, * and /, ^, functions
        //                                                4,       3, 2,         1
        // mathematical functions: sqrt, ln, exp, log, antilog
        // mathematical symbols: e, pi
        let cracking_candidate;
        let cracking_candidate_priority = 0;
        let cracking_candidate_special = null;
        let par_opened = 0;
        let par_closed = 0;
        for( let i = 0; i < str.length; i++ ) {
            if( ( str[ i ] > "/" && str[ i ] < ":" ) || str[ i ] === "." ) continue; // continue if the character is a number component
            else {
                if( str[ i ] === "(" ) par_opened++;
                else if( str[ i ] === ")" ) par_closed++;
                else if( par_opened === par_closed ) { // if the character is not within parentheses, check for candidates
                    if( ( str[ i ].includes( "+" ) || ( str[ i ].includes( "-" ) && i != 0 ) ) && cracking_candidate_priority < 4 ) {
                        cracking_candidate = i;
                        cracking_candidate_priority = 4;
                    } else if( ( str[ i ].includes( "*" ) || str[ i ].includes( "/" ) ) && cracking_candidate_priority < 3 ) {
                        cracking_candidate = i;
                        cracking_candidate_priority = 3;
                    } else if( str[ i ].includes( "^" ) && cracking_candidate_priority < 2 ) {
                        cracking_candidate = i;
                        cracking_candidate_priority = 2;
                    } else if( cracking_candidate_priority < 1 ) {
                        if( str[ i ].includes( "s" ) && str.substring( i, i + 4 ) === "sqrt" ) {
                            cracking_candidate_special = 4;
                            i += 3;
                        } else if( str[ i ].includes( "l" ) && str.substring( i, i + 2 ) === "ln" ) {
                            cracking_candidate_special = 2;
                            i++;
                        } else if( str[ i ].includes( "e" ) && str.substring( i, i + 3 ) === "exp" ) {
                            cracking_candidate_special = 3;
                            i += 2;
                        } else if( str[ i ].includes( "l" ) && str.substring( i, i + 3 ) === "log" ) {
                            cracking_candidate_special = 3;
                            i += 2;
                        } else if( str[ i ].includes( "a" ) && str.substring( i, i + 7 ) === "antilog" ) {
                            cracking_candidate_special = 7;
                            i += 6;
                        } else continue;
                        cracking_candidate_priority = 1;
                        cracking_candidate = i;
                    }
                }
            }
        }
        if( cracking_candidate_priority > 1 ) {
            return [ str.substring( 0, cracking_candidate ), str[ cracking_candidate ], str.substring( cracking_candidate + 1, str.length ) ];
        } else {
            return [ str.substring( 0, cracking_candidate_special ), str.substring( cracking_candidate_special, str.length ) ];
        }
    }
    number_convert( subset_math ) {
        // recursive function that, for each non-list entry from the 1st to the
        // nth dimension, converts strings representing numbers or constants into
        // SignificantNumber objects in preparation for creating and computing
        // some number of SignificantOperation objects
        // the most particular operation done by this function is determining
        // what the appropriate number of singificant figures are for a particular
        // number depending on user input
        // for typical non-zero and non-constant numbers, it stores the value by
        // making a copy of the floating point version of the string
        // it then removes any negative signs from the number and any extra leading
        // zeros to remove interference from using length to determine the number
        // of significant figures
        // if a decimal is present, then the number of significant figures is the
        // length minus one
        // if there's no decimal, then it's the length of the string minus the
        // number of contiguous zeros on the right side of the number
        for( let i = 0; i < subset_math.length; i++ ) {
            if( Array.isArray( subset_math[ i ] ) ) subset_math[ i ] = this.number_convert( subset_math[ i ] );
            else if( subset_math[ i ] === "e" ) subset_math[ i ] = new SignificantNumber( Math.E, Infinity );
            else if( subset_math[ i ] === "pi" ) subset_math[ i ] = new SignificantNumber( Math.PI, Infinity );
            else if( !( parseFloat( subset_math[ i ] ) ) && parseFloat( subset_math[ i ] ) != 0 ) continue; // prevents non-numbers from being turned into SignificantNumber objects
            else {
                let n = parseFloat( subset_math[ i ] );
                let sf;
                if( subset_math[ i ][ 0 ] === "-" ) subset_math[ i ] = subset_math[ i ].substring( 1, subset_math[ i ].length ); // removing sign for significant figure analysis
                if( subset_math[ i ].includes( "e" ) ) { sf = subset_math[ i ].split( "e" )[ 0 ].length - 1; // handling cases of scientific notation
                } else { // handling cases of normal numbers
                    if( n === 0 ) { // significant figures of zero
                        if( subset_math[ i ].includes( "." ) ) sf = subset_math[ i ].split( "." )[ 1 ].length + 1;
                        else sf = 1;
                    } else {
                        while( subset_math[ i ][ 0 ] === "0" ) subset_math[ i ] = subset_math[ i ].substring( 1, subset_math[ i ].length ); // crop zeros from beginning
                        if( subset_math[ i ].includes( "." ) ) sf = subset_math[ i ].length - 1;
                        else { // crop zeros from the end if no decimal is present
                            while( subset_math[ i ][ subset_math[ i ].length - 1 ] === "0" ) subset_math[ i ] = subset_math[ i ].substring( 0, subset_math[ i ].length - 1 );
                            sf = subset_math[ i ].length;
                        }
                    }
                }
                subset_math[ i ] = new SignificantNumber( n, sf );
            }
        }
        return subset_math;
    }
    operate_and_resolve( converted_math ) {
        // recursive function that, from the nth dimension-lowest list to the
        // first, turns those lists into a SignificantOperation objest and
        // resolves it into a SignificantNumber object, eventually resulting
        // in a single SignificantNumber, which is the answer
        for( let i = 0; i < converted_math.length; i++ ) if( Array.isArray( converted_math[ i ] ) ) converted_math[ i ] = this.operate_and_resolve( converted_math[ i ] );
        for( let i = 0; i < 5; i++ ) if( converted_math[ 1 ] === [ "+", "-", "*", "/", "^" ][ i ] ) return new SignificantOperation( converted_math[ 0 ], converted_math[ 2 ], i ).answer; // operators for symbols
        for( let i = 5; i < 10; i++ ) if( converted_math[ 0 ] === [ "sqrt", "ln", "exp", "log", "antilog" ][ i - 5 ] ) return new SignificantOperation( converted_math[ 1 ], null, i ).answer; // if a recognized function, use the appropriate operation
    }
    get answer() {
        return this.solution;
    }
}
