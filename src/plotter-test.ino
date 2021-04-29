#include "Plotter.h"

int x;
int min = 0;
int max =100;

Plotter p;

void setup()
{
        p.Begin();
        p.AddTimeGraph( "Some title of a graph", 150, "label for x", x, "label for min", min, "label for max", max);

}

void loop() {

        if (x >= 100) {
                x = 0;
        }

        p.Plot(); // usually called within loop()
        x++;
        delay(10);

}
