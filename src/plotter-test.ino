#include "Plotter.h"

double x;
double min = 0;
double max =100;

Plotter p;

void setup()
{
        p.Begin();
        p.AddTimeGraph( "Some title of a graph", 100, "label for x", x, "label for min", min, "label for max", max);

}

void loop() {

        if (x >= 100) {
                x = 0;
        }

        p.Plot(); // usually called within loop()
        x++;
        delay(100);

}
