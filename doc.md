# Signals

There are three reactive primitives in regard to signals:

- writable signals, modify value directly
- computed signals, values derived from other signals
- effects, functions that are activated when something changes, also on initial values. Effects always runs once! One should not update any signals in effects, this may lead to infinit loops. Tested did work ok! (?)
