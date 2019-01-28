import reducer from 'reducer';

decscribe('calendar reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            
        });
    });
});