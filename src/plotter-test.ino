#include "Plotter.h"

int x;
int min = 0;
int max =100;
float plot_value_1 = 0;

Plotter p;

void setup()
{
        p.Begin();
        p.AddTimeGraph( "Some title of a graph: ", 200, "50 + (40 * cos(x * (PI / 2) / 25))", plot_value_1, "label for min", min, "label for max", max);

}

void loop() {

        if (x >= 100) {
                x = 0;
        }

        plot_value_1 = 50 + (40 * cos(x * (PI / 2) / 25));

        p.Plot(); // usually called within loop()
        x++;
        delay(50);

}
