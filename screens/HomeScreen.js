import { View, Text, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from "lodash";
import { theme } from '../theme';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({})


  const handleSearch = search => {
    // console.log('value: ',search);
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then(data => {
        // console.log('got locations: ',data);
        setLocations(data);
      })
  }

  const handleLocation = loc => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    })
  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    console.log('fetchMyWeatherData = ')
    let myCity = await getData('city');
    let cityName = 'puyallup';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      console.log('got data: ', data.forecast.forecastday[0].day.daily_chance_of_rain);
      setWeather(data);
      setLoading(false);
    })

  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  const temperature = current?.temp_f || 0; // Default to 0 if temperature data is unavailable
  let temperatureImageKey = 'other'; // Default image key
  let recommendedoutfit = 'other'
  if (temperature >= 0 && temperature <= 49) {

    const randomNumber = Math.floor(Math.random() * 7) + 1;
    temperatureImageKey = 'temperature_between_0_50_' + randomNumber; // Update with the appropriate image key
    recommendedoutfit = 'temperature_between_0_50_message';


  }
  else if (temperature >= 50 && temperature <= 59) {

    const randomNumber = Math.floor(Math.random() * 1) + 1;
    temperatureImageKey = 'temperature_between_50_60_' + randomNumber; // Update with the appropriate image key
    recommendedoutfit = 'temperature_between_50_60_message';


  }
  else if (temperature >= 60 && temperature <= 79) {

    const randomNumber = Math.floor(Math.random() * 2) + 1;
    temperatureImageKey = 'temperature_between_60_80_' + randomNumber; // Update with the appropriate image key
    recommendedoutfit = 'temperature_between_60_80_message';



  }
  else if (temperature >= 80) {

    const randomNumber = Math.floor(Math.random() * 5) + 1;
    temperatureImageKey = 'temperature_between_80_90_' + randomNumber; // Update with the appropriate image key
    recommendedoutfit = 'temperature_between_80_90_message';



  }

  console.log('temperatureImageKey = ' + temperatureImageKey)
  console.log('recommendedoutfit = ' + recommendedoutfit)
  console.log('recommendedoutfit = ' + weatherImages[recommendedoutfit])

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <Image
        blurRadius={100}
        source={require('../assets/images/bg.png')}
        className="absolute w-full h-full" />
      {
        loading ? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/* search section */}
            <View style={{ height: '7%' }} className="mx-4 relative z-50">
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>

                {
                  showSearch ? (
                    <TextInput
                      onChangeText={handleTextDebounce}
                      placeholder="Search city"
                      placeholderTextColor={'lightgray'}
                      className="pl-6 h-10 pb-1 flex-1 text-base text-white"
                    />
                  ) : null
                }
                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  className="rounded-full p-3 m-1"
                  style={{ backgroundColor: theme.bgWhite(0.3) }}>
                  {
                    showSearch ? (
                      <XMarkIcon size="25" color="white" />
                    ) : (
                      <MagnifyingGlassIcon size="25" color="white" />
                    )
                  }

                </TouchableOpacity>
              </View>
              {
                locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl ">
                    {
                      locations.map((loc, index) => {
                        let showBorder = index + 1 != locations.length;
                        let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleLocation(loc)}
                            className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}>
                            <MapPinIcon size="20" color="gray" />
                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                ) : null
              }

            </View>

            {/* forecast section */}
            <View className="mx-4 flex justify-around flex-1 mb-2">
              {/* location */}
              <Text className="text-white text-center text-2xl font-bold">
                {location?.name}
              </Text>
              {/* weather icon */}
              <View className="flex-row justify-center">
                <Image
                  // source={{uri: 'https:'+current?.condition?.icon}} 
                  source={weatherImages[temperatureImageKey || 'other']}
                  className="w-60 h-60"
                />

              </View>
              {/* degree celcius */}
              <View className="space-y-1">
                <Text className="text-center text-white text-xl tracking-widest mb-50">
                  {weatherImages[recommendedoutfit]}
                </Text>
                <Text className="text-center font-bold text-white text-6xl ml-5">
                  {current?.temp_f}&#176;
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {current?.condition?.text}
                </Text>
              </View>

              {/* other stats */}


            </View>

            {/* forecast for next days */}



          </SafeAreaView>
        )
      }

    </View>
  )
}
